const pool = require('./dbconnect');
const bcrypt = require('bcrypt');
const { logger } = require('../middleware/logEvents');
const handleQueryError = (err, req, res) => {
  logger.error(`${err.message},\n                                       req: ${JSON.stringify(req.body)}`);
  res.status(500).json({ message: err.message });
};

const getUser = async (req, res) => {
  pool.query('SELECT * FROM userdata ORDER BY userid ASC', 
  (error, results) =>  { 
    if (error) {
      handleQueryError(error, req, res);
    } else {
      res.status(200).json(results.rows);
    }
  });
};

const getUserById = async (req, res) => {
  const userid = req.params.userid;
  pool.query('SELECT * FROM userdata WHERE userid = $1',  [userid], 
    (error, results) =>  { 
      if (error) {
        handleQueryError(error, req, res); 
      } else {
        res.status(200).json(results.rows);
      }
  })
};


const createUser = async (req, res) => {
  const {userid, email, username, role, password} = req.body;
  const hashedPwd = await bcrypt.hash(password, 10);
 
  pool.query(
    'INSERT INTO userdata (userid, email, username, role, hashkey, lastaccess) VALUES ($1, $2, $3, $4, $5, NOW())',
    [userid, email, username, role, hashedPwd],
    (error) =>  { 
      if (error) {
        handleQueryError(error, req, res);
      } else {
        res.status(201).json({ 'message': 'tersimpan' });
      }
    }
  )
}

const updateUser = async (req, res) => {
  const {userid, email, username, role, password} = req.body;
  const hashedPwd = await bcrypt.hash(password, 10);
  pool.query(
    'UPDATE userdata SET email = $2, username = $3, role = $4, hashkey = $5, lastaccess = NOW() WHERE userid = $1',
    [userid, email, username, role, hashedPwd],
    (error) =>  { 
      if (error) {
        handleQueryError(error, req, res);  
      } else {
        res.status(200).json({ 'message': 'terbarui' });
      }
    }
  );
}

const deleteUser = async (req, res) => {
  const {userid} = req.body;
  pool.query(
    'DELETE FROM userdata WHERE userid = $1', [userid],
    (error, results) =>  { 
      if (error) {
        handleQueryError(error, req, res);  
      } else {
        res.status(200).json({ 'message': 'terhapus' });
      }
    }
  )
}

module.exports = {
  getUser,
  getUserById,
  createUser,
  updateUser,
  deleteUser
}