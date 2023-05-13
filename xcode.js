const pool = require('./controllers/dbconnect');
const devid = 'RPdl1kcwtkMvd6u';

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
          codeVar += varrecord[i].varname + ` = 0;\n`;
        }

        // siapkan bagian konstruksi timer
        let codeTimerInit = '';
        let codeProcDeclare = '';
        let codeinitSystemVar = '';
        let codeSystemUpdateEnd = `       String postdata;\n` +
                                  `       serializeJson(doc,postdata);\n` +
                                  `       int errcode=sendJSON(postdata);\n`+
                                  `       if (errcode==403 || errcode==401) {\n`+
                                  `         // get token retry 5x\n`+ 
                                  `         for (int i=0; i<5; i++) {\n`+
                                  `            logged = getAuth() ;\n`+
                                  `            if (logged) {\n`+
                                  `               break;\n`+
                                  `            }\n`+
                                  `         }\n`+
                                  `         if (logged) {\n` +
                                  `            errcode=sendJSON(postdata);\n` +
                                  `         }\n`+
                                  `       }\n`+
                                  `       return;\n`+
                                  `    }\n  }\n\n`;

        let codeSys = `void systemUpdate() {\n` +
                      `  unsigned long currentMillis = millis(); \n`;

        for (let i=0; i<totsched; i++) {
          codeTimerInit +=  `unsigned long interval_${schedrecord[i].schedid} = ${schedrecord[i].schedtime*1000};\n`+
                            `unsigned long prevMillis_${schedrecord[i].schedid} = 0;\n`;
          codeProcDeclare +=  `void proc_${schedrecord[i].schedid}() {\n`+
                              `  // prosedur ini akan dijalankan setiap ${schedrecord[i].schedtime} detik.\n\n}\n\n`;

          codeinitSystemVar  += `  prevMillis_${schedrecord[i].schedid} = millis();\n`;
          codeSys +=  `  if (currentMillis - prevMillis_${schedrecord[i].schedid} >= interval_${schedrecord[i].schedid}) {\n` +
                      `    prevMillis_${schedrecord[i].schedid} = millis();\n` +
                      `    proc_${schedrecord[i].schedid}();\n\n` +
                      `    if (WiFi.status()== WL_CONNECTED) {\n` +
                      `       DynamicJsonDocument doc(2056);\n` ;

          let z=0;
          for (let y=0; y<totvar; y++) {
            if (varrecord[y].schedid == schedrecord[i].schedid) {
              codeSys +=  `       doc[${z}]["varid"]   = "${varrecord[y].varid}";\n`  +
                          `       doc[${z}]["devtime"] = devTime;\n`;

              if (varrecord[y].vartype=='I' || varrecord[y].vartype=='B') {
                codeSys +=  `       doc[${z}]["dvalue"]  = 0;\n` +
                            `       doc[${z}]["ivalue"]  = ${varrecord[y].varname};\n\n` ;
              }

              if (varrecord[y].vartype=='D') {
                codeSys +=  `       doc[${z}]["dvalue"]  = ${varrecord[y].varname}};\n` +
                            `       doc[${z}]["ivalue"]  = 0;\n\n` ;
              }
              z++;
            }
          }

          codeSys += codeSystemUpdateEnd ;
        }

        // persiapkan bagian potongan kode system update yang meliputi tiap timernya

        // selanjutnya sekarang construct semua code
        // bagian keterangan header
        let code =  `/* \n\n` +
          `Potongan code dibawah ini di generate lewat IoT Platform untuk perangkat dibawah ini:\n\n` +
          `  ** Data Device ** \n` +
          `  Nama Device  : ${devrecord[0].devname} \n` +
          `  Type Device  : ${devrecord[0].devtype} \n` +
          `  Model Device : ${devrecord[0].devmodel} \n\n*/\n\n`;
      
        //bagian include & inisialisasi variabel
        code += `#include <ESP8266WiFi.h> \n` +
                `#include <ESP8266HTTPClient.h> \n` +
                `#include <WiFiClient.h> \n` +
                `#include <ArduinoJson.h> \n\n`+
                `//-- Library tambahan (user defined) diletakkan dibawah ini ------- \n\n\n` +
                `//-- Variabel u/ system -- jangan diubah! --- \n` + 
                `const char* ssid         = "${devrecord[0].ssid}"; \n` +
                `const char* password     = "${devrecord[0].wifipass}";\n`+
                `const char* urlLoc       = "http://192.168.18.4:3500/iotdata"; \n` +
                `const char* urlLocAuth   = "http://192.168.18.4:3500/auth"; \n` +
                `String token   = "";\n`+
                `bool   logged  = 0;\n`+
                `WiFiClient client;\n`+
                `HTTPClient http;\n\n`+
                codeVar+`\n`+
                codeTimerInit +`\n`;
      
        // deklarasi custom procedure
        code += `//-- declare variable tambahan di bawah ini ----- \n\n\n`+
                `//-- custom procedure diletakkan di bawah ini ----\n\n`+
                codeProcDeclare+ `\n` +
                `void customProcedure() {\n`+
                `  // prosedur custom boleh ditambahkan disini, dan akan dieksekusi dalam loop\n\n}\n\n` +
                `void customSetup() {\n`+
                `  // prosedur setup custom boleh ditambahkan disini, dan akan dieksekusi saat setup()\n\n}\n\n` +
                `//-- system setup procedure -- jangan diubah bila tidak paham ------\n` +
                `void initSystemVar() {\n`+
                codeinitSystemVar+`\n}\n\n`;
                

        // deklarasi setup()
        code += `void setup() {\n` +      
                `  // system setup --- jangan diubah! ---\n`+
                `  Serial.begin(9600); \n\n`+
                `  // inisialisasi sytem variable --- jangan diubah! -- \n` +
                `  initSystemVar();\n` +
                `  WiFi.begin(ssid, password);\n` +
                `  while(WiFi.status() != WL_CONNECTED) {\n` +
                `     delay(500);\n  }\n\n` +
                `  // try getting authentication 5x\n` +
                `  for (int i=0; i<5 ; i++) {\n` +
                `     logged = getAuth() ;\n` +
                `     if (logged) {\n` +
                `        break;\n     }\n  }\n` +
                `  if (!logged) {\n` +
                `     Serial.println("login failed");\n` +
                `     while(1);\n  }\n` +
                `  customSetup();\n}\n\n` ;
        // deklarasi loop() 
        code += `void loop() {\n` +
                `  // system update.. jangan diubah!!!!...\n` +
                `  systemUpdate();\n` +
                `  customProcedure();\n}\n\n` ;


        // deklarasi system procedure          
        code += `//-- system procedure disini -----\n\n` +
                `bool getAuth() {\n` +
                `  DynamicJsonDocument doc(256); \n`+
                `  doc["devid"]  = "${devrecord[0].devid}";\n` +
                `  doc["devpwd"] = "${devrecord[0].key}";\n\n` +
                `  String postdata;\n` +
                `  serializeJson(doc,postdata); \n\n` +
                `  http.begin(client, urlLocAuth); \n` +
                `  http.addHeader("Content-Type", "application/json"); \n\n` +
                `  int httpResponseCode = http.POST(postdata);\n`+
                `  if (httpResponseCode == 200) {\n` +
                `     String respText = http.getString();\n` +
                `     DynamicJsonDocument doc(256);\n` +
                `     DeserializationError err = deserializeJson(doc, respText);\n` +
                `     token = doc["token"].as<String>();\n` +
                `     return true;\n  }\n` +
                `  http.end();\n` +
                `  return false;\n}\n\n` +
                `String strZero(int n, int ln) { \n` +
                `  String retval = String(n); \n` +
                `  retval.trim();\n` +
                `  for (int i=retval.length(); i<ln; i++) {\n` +
                `     retval = "0"+ retval;\n  }\n` +
                `  return retval;\n}\n\n` +
                `String dateTimeString(DateTime dt) { \n` +
                `  return strZero(dt.year(),4)+"-"+strZero(dt.month(),2)+"-"+strZero(dt.day(),2)+" "+strZero(dt.hour(),2)+":"+strZero(dt.minute(),2)+":"+strZero(dt.second(),2);\n}\n\n` +
                `int sendJSON(String postdata) { \n` +
                `  http.begin(client, urlLoc); \n` +
                `  http.addHeader("Content-Type", "application/json"); \n` +
                `  http.addHeader("authorization", token);\n` +
                `  int httpResponseCode = http.POST(postdata);\n` +
                `  http.end();\n` +
                `  return httpResponseCode;\n}\n\n` ;

        // deklarasi systemUpdate()
        code += codeSys + `}\n`;
      
        console.log(code);
      });


    });

  });

} catch (err) {
  console.log(err);
}
