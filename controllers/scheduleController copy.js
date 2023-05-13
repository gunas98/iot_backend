const pool = require('./dbconnect');
const { logger } = require('../middleware/logEvents');

const handleQueryError = (err, req, res) => {
  logger.error(`${err.message},\n                                       req: ${JSON.stringify(req.body)}`);
  res.status(500).json({ message: err.message });
};


const getSchedule = async (req, res) => {
    pool.query('SELECT * FROM schedule', (error, results) => {
      if (error) { throw error; }
      res.status(200).json(results.rows);
    });
};

const getScheduleById = async (req, res) => {
    const schedid = req.params.schedid;
    try {
      pool.query('SELECT * FROM schedule WHERE schedid = $1',  [schedid], (error, results) => {
        if (error) {  throw error;  }
        res.status(200).json(results.rows);
      });
    } catch (error) {
      logger.error('An error occurred:', err);
    }
    
};


const createSchedule = async (req, res) => {
  const {schedid, schedtype, schedtime} = req.body;
  pool.query(
    'INSERT INTO schedule (schedid, schedtype, schedtime, lastaccess) VALUES ($1, $2, $3, NOW())',
    [schedid, schedtype, schedtime],
    (error) => {
      if (error) {
        handleQueryError(error, req, res);
      } else {
        res.status(201).json({ message: 'tersimpan' });
      }
    }
    
  );
}

const updateSchedule = async (req, res) => {
    const {schedid, schedtype, schedtime} = req.body;

    try {

        pool.query(
          'UPDATE schedule SET schedtype = $2, schedtime = $3, lastaccess = NOW() WHERE schedid = $1',
          [schedid, schedtype, schedtime],
          (error, results) => {
                                if (error) { throw error;   }
                                res.status(200).json({ 'message': 'terbarui' });
                              }
        );
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
}

const deleteSchedule = async (req, res) => {
  const {schedid} = req.body;
  try {

        pool.query(
          'DELETE FROM schedule WHERE schedid = $1', [schedid],
          (error, results) => {
                                if (error) { throw error; }
                                res.status(200).json({ 'message': 'terhapus' });
                              }

      );

    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
}

module.exports = {
  getSchedule,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule
}