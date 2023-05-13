const pool = require('./dbconnect');
const { logger } = require('../middleware/logEvents');

const handleQueryError = (err, req, res) => {
  logger.error(`${err.message},\n                                       req: ${JSON.stringify(req.body)}`);
  res.status(500).json({ message: err.message });
};

const getIotdata = async (req, res) => {
  pool.query('SELECT * FROM iotdata', (error, results) => {
    if (error) { 
      handleQueryError(error, req, res);
    } else {
      res.status(200).json(results.rows);
    }
    
  });
};

const getIotdataWithFilter = async (req, res) => {
  const varid = req.params.varid;
  pool.query('SELECT * FROM iotdata WHERE varid = $1',  [varid], (error, results) => {
    if (error) {  
      handleQueryError(error, req, res);  
    } else {
      res.status(200).json(results.rows);
    }
  });
};

const createIotdata = async (req, res) => {
  const data = req.body;
  for (let i = 0; i < data.length; i++) {
    pool.query(
      'INSERT INTO iotdata (varid, devtime, dvalue, ivalue, svrtime) VALUES ($1, $2, $3, $4, NOW())',
      [data[i].varid, data[i].devtime, data[i].dvalue, data[i].ivalue],
      (error, results) => { 
        if (error) {
          handleQueryError(error, req, res); 
        } else {
          res.status(201).json({ 'mesage': 'tersimpan'  });
        } 
      }
    );
  }
}


module.exports = {
  getIotdata,
  getIotdataWithFilter,
  createIotdata,
}