const pool = require('./dbconnect');
const os = require('os');
const newline = os.platform() === 'win32' ? '\r\n' : '\n';

const generateCode = async (req, res) => {
  const {devid, authpath, iotpath} = req.body
  
  try {
      // get device information
      pool.query('SELECT a.*, b.key FROM device a, secretkey b WHERE a.devid = $1 and a.devid = b.devid',  [devid], (error, results) => {
        if (error) { throw error; }
        let totdev = results.rowCount; 
        if (totdev ==0) { throw 'NO RECORD'};
        let devrecord = results.rows;

        // selanjut ambil informasi jenis schedule yang mungkin terjadi di device variable
        pool.query('SELECT DISTINCT a.schedid, b.schedtype, b.schedtime FROM devicevar a, schedule b WHERE devid = $1 AND a.schedid = b.schedid' ,  [devid], (error, results) => {
          if (error) { throw error; }
          let totsched = results.rowCount;
          if (totsched==0) { throw 'NO RECORD'};
          let schedrecord = results.rows;

          // selanjutnya ambil semua informasi device variable yang ada dalam device ini..
          pool.query('SELECT * FROM devicevar WHERE devid = $1 ORDER BY schedid' ,  [devid], (error, results) => {
            if (error) { throw error; }
            let totvar = results.rowCount;
            if (totvar==0) { throw 'NO RECORD'};
            let varrecord = results.rows;

            // siapkan bagian konstruksi variabel variabel
            let codeVar =  '';
            
            for (let i=0; i<totvar; i++) {
              if (varrecord[i].vartype == 'I') {
                codeVar +=  'int   ';

              } else if(varrecord[i].vartype == 'B') {
                codeVar +=  'bool  ';
              } else if(varrecord[i].vartype == 'D') {
                codeVar +=  'float ';
              }
              codeVar += varrecord[i].varname + ` = 0;${newline}`;
            }

            // siapkan bagian konstruksi timer
            let codeTimerInit = '';
            let codeProcDeclare = '';
            let codeinitSystemVar = '';
            let codeSystemUpdateEnd = `       String postdata;${newline}` +
                                      `       serializeJson(doc,postdata);${newline}` +
                                      `       int errcode=sendJSON(postdata);${newline}`+
                                      `       if (errcode==403 || errcode==401) {${newline}`+
                                      `         // get token retry 5x${newline}`+ 
                                      `         for (int i=0; i<5; i++) {${newline}`+
                                      `            logged = getAuth() ;${newline}`+
                                      `            if (logged) {${newline}`+
                                      `               break;${newline}`+
                                      `            }${newline}`+
                                      `         }${newline}`+
                                      `         if (logged) {${newline}` +
                                      `            errcode=sendJSON(postdata);${newline}` +
                                      `         }${newline}`+
                                      `       }${newline}`+
                                      `       return;${newline}`+
                                      `    }${newline}  }${newline}${newline}`;

            let codeSys = `void systemUpdate() {${newline}` +
                          `  unsigned long currentMillis = millis(); ${newline}`;

            for (let i=0; i<totsched; i++) {
              codeTimerInit +=  `unsigned long interval_${schedrecord[i].schedid} = ${schedrecord[i].schedtime*1000};${newline}`+
                                `unsigned long prevMillis_${schedrecord[i].schedid} = 0;${newline}`;
              codeProcDeclare +=  `void proc_${schedrecord[i].schedid}() {${newline}`+
                                  `  // prosedur ini akan dijalankan setiap ${schedrecord[i].schedtime} detik.${newline}${newline}}${newline}${newline}`;

              codeinitSystemVar  += `  prevMillis_${schedrecord[i].schedid} = millis();${newline}`;
              codeSys +=  `  if (currentMillis - prevMillis_${schedrecord[i].schedid} >= interval_${schedrecord[i].schedid}) {${newline}` +
                          `    prevMillis_${schedrecord[i].schedid} = millis();${newline}` +
                          `    proc_${schedrecord[i].schedid}();${newline}${newline}` +
                          `    if (WiFi.status()== WL_CONNECTED) {${newline}` +
                          `       DynamicJsonDocument doc(2056);${newline}` ;

              let z=0;
              for (let y=0; y<totvar; y++) {
                if (varrecord[y].schedid == schedrecord[i].schedid) {
                  codeSys +=  `       doc[${z}]["varid"]   = "${varrecord[y].varid}";${newline}`  +
                              `       doc[${z}]["devtime"] = devTime;${newline}`;

                  if (varrecord[y].vartype=='I' || varrecord[y].vartype=='B') {
                    codeSys +=  `       doc[${z}]["dvalue"]  = 0;${newline}` +
                                `       doc[${z}]["ivalue"]  = ${varrecord[y].varname};${newline}${newline}` ;
                  }

                  if (varrecord[y].vartype=='D') {
                    codeSys +=  `       doc[${z}]["dvalue"]  = ${varrecord[y].varname}};${newline}` +
                                `       doc[${z}]["ivalue"]  = 0;${newline}${newline}` ;
                  }
                  z++;
                }
              }

              codeSys += codeSystemUpdateEnd ;
            }

            // persiapkan bagian potongan kode system update yang meliputi tiap timernya

            // selanjutnya sekarang construct semua code
            // bagian keterangan header
            let code =  `/* ${newline}${newline}` +
              `Potongan code dibawah ini di generate lewat IoT Platform untuk perangkat dibawah ini:${newline}${newline}` +
              `  ** Data Device ** ${newline}` +
              `  Nama Device  : ${devrecord[0].devname} ${newline}` +
              `  Type Device  : ${devrecord[0].devtype} ${newline}` +
              `  Model Device : ${devrecord[0].devmodel} ${newline}${newline}*/${newline}${newline}`;
          
            //bagian include & inisialisasi variabel
            code += `#include <ESP8266WiFi.h> ${newline}` +
                    `#include <ESP8266HTTPClient.h> ${newline}` +
                    `#include <WiFiClient.h> ${newline}` +
                    `#include <ArduinoJson.h> ${newline}${newline}`+
                    `//-- Library tambahan (user defined) diletakkan dibawah ini ------- ${newline}${newline}${newline}` +
                    `//-- Variabel u/ system -- jangan diubah! --- ${newline}` + 
                    `const char* ssid         = "${devrecord[0].ssid}"; ${newline}` +
                    `const char* password     = "${devrecord[0].wifipass}";${newline}`+
                    `const char* urlLoc       = "${iotpath}"; ${newline}` +
                    `const char* urlLocAuth   = "${authpath}"; ${newline}` +
                    `String token   = "";${newline}`+
                    `bool   logged  = 0;${newline}`+
                    `WiFiClient client;${newline}`+
                    `HTTPClient http;${newline}${newline}`+
                    codeVar+`${newline}`+
                    codeTimerInit +`${newline}`;
          
            // deklarasi custom procedure
            code += `//-- declare variable tambahan di bawah ini ----- ${newline}${newline}${newline}`+
                    `//-- custom procedure diletakkan di bawah ini ----${newline}${newline}`+
                    codeProcDeclare+ `${newline}` +
                    `void customProcedure() {${newline}`+
                    `  // prosedur custom boleh ditambahkan disini, dan akan dieksekusi dalam loop${newline}${newline}}${newline}${newline}` +
                    `void customSetup() {${newline}`+
                    `  // prosedur setup custom boleh ditambahkan disini, dan akan dieksekusi saat setup()${newline}${newline}}${newline}${newline}` +
                    `//-- system setup procedure -- jangan diubah bila tidak paham ------${newline}` +
                    `void initSystemVar() {${newline}`+
                    codeinitSystemVar+`${newline}}${newline}${newline}`;
                    

            // deklarasi setup()
            code += `void setup() {${newline}` +      
                    `  // system setup --- jangan diubah! ---${newline}`+
                    `  Serial.begin(9600); ${newline}${newline}`+
                    `  // inisialisasi sytem variable --- jangan diubah! -- ${newline}` +
                    `  initSystemVar();${newline}` +
                    `  WiFi.begin(ssid, password);${newline}` +
                    `  while(WiFi.status() != WL_CONNECTED) {${newline}` +
                    `     delay(500);${newline}  }${newline}${newline}` +
                    `  // try getting authentication 5x${newline}` +
                    `  for (int i=0; i<5 ; i++) {${newline}` +
                    `     logged = getAuth() ;${newline}` +
                    `     if (logged) {${newline}` +
                    `        break;${newline}     }${newline}  }${newline}` +
                    `  if (!logged) {${newline}` +
                    `     Serial.println("login failed");${newline}` +
                    `     while(1);${newline}  }${newline}` +
                    `  customSetup();${newline}}${newline}${newline}` ;
            // deklarasi loop() 
            code += `void loop() {${newline}` +
                    `  // system update.. jangan diubah!!!!...${newline}` +
                    `  systemUpdate();${newline}` +
                    `  customProcedure();${newline}}${newline}${newline}` ;


            // deklarasi system procedure          
            code += `//-- system procedure disini -----${newline}${newline}` +
                    `bool getAuth() {${newline}` +
                    `  DynamicJsonDocument doc(256); ${newline}`+
                    `  doc["devid"]  = "${devrecord[0].devid}";${newline}` +
                    `  doc["devpwd"] = "${devrecord[0].key}";${newline}${newline}` +
                    `  String postdata;${newline}` +
                    `  serializeJson(doc,postdata); ${newline}${newline}` +
                    `  http.begin(client, urlLocAuth); ${newline}` +
                    `  http.addHeader("Content-Type", "application/json"); ${newline}${newline}` +
                    `  int httpResponseCode = http.POST(postdata);${newline}`+
                    `  if (httpResponseCode == 200) {${newline}` +
                    `     String respText = http.getString();${newline}` +
                    `     DynamicJsonDocument doc(256);${newline}` +
                    `     DeserializationError err = deserializeJson(doc, respText);${newline}` +
                    `     token = doc["token"].as<String>();${newline}` +
                    `     return true;${newline}  }${newline}` +
                    `  http.end();${newline}` +
                    `  return false;${newline}}${newline}${newline}` +
                    `String strZero(int n, int ln) { ${newline}` +
                    `  String retval = String(n); ${newline}` +
                    `  retval.trim();${newline}` +
                    `  for (int i=retval.length(); i<ln; i++) {${newline}` +
                    `     retval = "0"+ retval;${newline}  }${newline}` +
                    `  return retval;${newline}}${newline}${newline}` +
                    `String dateTimeString(DateTime dt) { ${newline}` +
                    `  return strZero(dt.year(),4)+"-"+strZero(dt.month(),2)+"-"+strZero(dt.day(),2)+" "+strZero(dt.hour(),2)+":"+strZero(dt.minute(),2)+":"+strZero(dt.second(),2);${newline}}${newline}${newline}` +
                    `int sendJSON(String postdata) { ${newline}` +
                    `  http.begin(client, urlLoc); ${newline}` +
                    `  http.addHeader("Content-Type", "application/json"); ${newline}` +
                    `  http.addHeader("authorization", token);${newline}` +
                    `  int httpResponseCode = http.POST(postdata);${newline}` +
                    `  http.end();${newline}` +
                    `  return httpResponseCode;${newline}}${newline}${newline}` ;

            // deklarasi systemUpdate()
            code += codeSys + `}${newline}`;
            // send back
            res.status(200).json({ 'code': code });
          });


        });

      });

  } catch (err) {
      res.status(500).json({ 'message': err.message });
  }
}

module.exports = {generateCode} ;
