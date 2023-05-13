const pool = require('./dbconnect');
const { logger } = require('../middleware/logEvents');

const handleQueryError = (err, req, res) => {
  logger.error(`${err.message},\n                                       req: ${JSON.stringify(req.body)}`);
  res.status(500).json({ message: err.message });
};

const getDashboard = async (req, res) => {
  pool.query('SELECT * FROM dashboard ORDER BY dashboardid ASC', (error, results) => {
    if (error) { 
      handleQueryError(error, req, res); 
    } else {
      res.status(200).json(results.rows);
    }
  });
};

const getDashboardById = async (req, res) => {
  const dashboardid = req.params.dashboardid;
  pool.query('SELECT * FROM dashboard WHERE dashboardid = $1',  [dashboardid], (error, results) => {
    if (error) {  
      handleQueryError(error, req, res);  
    } else {
      res.status(200).json(results.rows);
    }
  });
};


const createDashboard = async (req, res) => {
  const {dashboardid, projectid , dashboardtitle, dashboarddesc } = req.body;
  pool.query(
    'INSERT INTO dashboard (dashboardid, projectid, dashboardtitle, dashboarddesc, lastaccess) VALUES ($1, $2, $3, $4, NOW())',
    [dashboardid, projectid, dashboardtitle, dashboarddesc],
    (error, results) => { 
      if (error) {
        handleQueryError(error, req, res); 
      } else {
        res.status(201).json({ 'message': 'tersimpan'  });
      }
    }
  ); 
}

const updateDashboard = async (req, res) => {
  const {dashboardid, projectid, dashboardtitle, dashboarddesc} = req.body;
  pool.query(
    'UPDATE dashboard SET projectid = $2, dashboardtitle = $3, dashboarddesc = $4, lastaccess = NOW() WHERE dashboardid = $1',
    [dashboardid, projectid, dashboardtitle, dashboarddesc],
    (error, results) => {
      if (error) { 
        handleQueryError(error, req, res);   
      } else {
        res.status(200).json({ 'message': 'terbarui' });
      }
    }
  );
}

const deleteDashboard = async (req, res) => {
  const {dashboardid} = req.body;
  pool.query(
    'DELETE FROM dashboard WHERE dashboardid = $1', [dashboardid],
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
  getDashboard,
  getDashboardById,
  createDashboard,
  updateDashboard,
  deleteDashboard
}