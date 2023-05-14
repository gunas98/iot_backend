const pool = require('./dbconnect');
const ShortUniqueId = require('short-unique-id');
const uid = new ShortUniqueId({ length: 15 });
const bcrypt = require('bcrypt');
const { logger } = require('../middleware/logEvents');

const handleQueryError = (err, req, res) => {
  logger.error(`${err.message},\n                                       req: ${JSON.stringify(req.body)}`);
  res.status(500).json({ message: err.message });
};

const getDevice = async (req, res) => {
  pool.query('SELECT * FROM device ORDER BY devname ASC', (error, results) => {
    if (error) { 
      handleQueryError(error, req, res);  
    } else {
      res.status(200).json(results.rows);
    }
  });
};

const getDeviceByDevId = async (req, res) => {
  const devid = req.params.devid;
  pool.query('SELECT * FROM device WHERE devid = $1',  [devid], (error, results) => {
    if (error) {
      handleQueryError(error, req, res);
    } else {
      res.status(200).json(results.rows);
    }
  });
};

const createNewDevice = async (req, res) => {
  const {password, devname, devtype, devmodel, ssid, wifipass} = req.body;
  const hashedPwd = await bcrypt.hash(password, 10);
  const devid = uid();
  pool.query(
    'INSERT INTO device (devid, hashkey, devname, devtype, devmodel, ssid, wifipass, lastaccess) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())',
    [devid, hashedPwd, devname, devtype, devmodel, ssid, wifipass],
    (error, results) => { 
      if (error) {
        handleQueryError(error, req, res); 
      } 
    }
  );

  // simpan password untuk sementara saja.. kelak bagian ini dihapus, karena database tidak menyimpan password
  pool.query(
    'INSERT INTO secretkey (devid, key) VALUES ($1, $2)',
    [devid, password],
    (error, results) => { 
      if (error) {
        handleQueryError(error, req, res); 
      } else {
        res.status(201).json({ 'devid': devid, 'message':'tersimpan'  });
      }
    }
  );
}

const updateDevice = async (req, res) => {
  const {devid, password, devtype, devmodel, ssid, wifipass} = req.body;
  // create hashkey...
  const hashedPwd = await bcrypt.hash(password, 10);
  pool.query(
    'UPDATE device SET hashkey = $2, devtype = $3, devmodel = $4, ssid = $5, wifipass = $6, lastaccess=NOW() WHERE devid = $1',
    [devid, hashedPwd, devtype, devmodel, ssid, wifipass],
    (error, results) => {
      if (error) { 
        handleQueryError(error, req, res);   
      } 
    }
  );


  // bagian ini bisa dihapus kelak...
  pool.query(
    'UPDATE secretkey SET key = $2 WHERE devid = $1',
    [devid, password],
    (error, results) => {
      if (error) { 
        handleQueryError(error, req, res);   
      } else {
        res.sendStatus(200);
        res.st
      }
    }
  );
}

const deleteDevice = async (req, res) => {
  const {devid} = req.body;
  // delete header first..
  pool.query(
      'DELETE FROM device WHERE devid = $1 ', [devid],
      (error, results) => {
        if (error) { 
          handleQueryError(error, req, res); 
        }
      }
  );

  // delete detail.. devicevar
  pool.query(
    'DELETE FROM devicevar WHERE devid = $1', [devid],
    (error, results) => {
      if (error) { 
        handleQueryError(error, req, res);
        }
    }
  );

  // delete secretkey
  pool.query(
    'DELETE FROM secretkey WHERE devid = $1', [devid],
    (error, results) => {
      if (error) { 
        handleQueryError(error, req, res); 
      } else {
          res.sendStatus(200);
      }
    }
  );
}

module.exports = {
  getDevice,
  getDeviceByDevId,
  createNewDevice,
  updateDevice,
  deleteDevice
}