const pool = require('./dbconnect');
const { logger } = require('../middleware/logEvents');

const handleQueryError = (err, req, res) => {
  logger.error(`${err.message},\n                                       req: ${JSON.stringify(req.body)}`);
  res.status(500).json({ message: err.message });
};

const getDashdevice = async (req, res) => {
  pool.query('SELECT * FROM dashdevice', (error, results) => {
    if (error) { 
      handleQueryError(error, req, res); 
    } else {
      res.status(200).json(results.rows);
    }
  });
};

const getDashdeviceById = async (req, res) => {
  const dashboardid = req.params.dashboardid;
  pool.query('SELECT * FROM dashdevice WHERE dashboardid = $1',  [dashboardid], (error, results) => {
    if (error) {  
      handleQueryError(error, req, res);  
    } else {
      res.status(200).json(results.rows);
    }
  });
};


const createDashdevice = async (req, res) => {
  const {dashboardid, devid} = req.body;
  pool.query(
    'INSERT INTO dashdevice (dashboardid, devid, lastaccess) VALUES ($1, $2, NOW())',
    [dashboardid, devid],
    (error, results) => { 
      if (error) {
        handleQueryError(error, req, res); 
      } else {
        res.status(201).json({ 'message': 'tersimpan'  });
      }
    }
  );  
}

const updateDashdevice = async (req, res) => {
  const {dashboardid, devid} = req.body;
  pool.query(
    'UPDATE dashdevice SET devid = $2, lastaccess = NOW() WHERE dashboardid = $1',
    [dashboardid, devid],
    (error, results) => {
      if (error) { 
        handleQueryError(error, req, res);   
      } else {
        res.status(200).json({ 'message': 'terbarui' });
      }
    }
  );
}

const deleteDashdevice = async (req, res) => {
  const {dashboardid} = req.body;
  pool.query(
    'DELETE FROM dashdevice WHERE dashboardid = $1', [dashboardid],
    (error, results) => {
      if (error) { 
        handleQueryError(error, req, res); 
      } else {
        res.status(200).json({ 'message': 'terhapus' });
      }
    }
  );
}

module.exports = {
  getDashdevice,
  getDashdeviceById,
  createDashdevice,
  updateDashdevice,
  deleteDashdevice
}