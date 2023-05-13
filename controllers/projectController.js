const pool = require('./dbconnect');
const { logger } = require('../middleware/logEvents');

const handleQueryError = (err, req, res) => {
  logger.error(`${err.message},\n                                       req: ${JSON.stringify(req.body)}`);
  res.status(500).json({ message: err.message });
};

const getProject = async (req, res) => {
  pool.query('SELECT * FROM project ORDER BY projectid ASC', (error, results) => {
    if (error) { 
      handleQueryError(error, req, res);
    } else {
      res.status(200).json(results.rows);
    }
  });
};

const getProjectById = async (req, res) => {
  const projectid = req.params.projectid;
  pool.query('SELECT * FROM projec WHERE projectid = $1',  [projectid], (error, results) => {
    if (error) {  
      handleQueryError(error, req, res);  
    } else {
      res.status(200).json(results.rows);
    }
  });
};


const createProject = async (req, res) => {
  const {projectid, userid, projectname, projectdesc} = req.body;
  pool.query(
    'INSERT INTO project (projectid, userid, projectname, projectdesc, lastaccess) VALUES ($1, $2, $3, $4, NOW())',
    [projectid, userid, projectname, projectdesc],
    (error, results) => { 
      if (error) {
        handleQueryError(error, req, res);
      } else {
        res.status(201).json({ 'message': 'tersimpan'  });
      }
    }
  );
}

const updateProject = async (req, res) => {
  const {projectid, userid, projectname, projectdesc} = req.body;
  pool.query(
    'UPDATE project SET userid = $2, projectname = $3, projectdesc = $4, lastaccess = NOW() WHERE projectid = $1',
    [projectid, userid, projectname, projectdesc],
    (error, results) => {
      if (error) { 
        handleQueryError(error, req, res);   
      } else {
        res.status(200).json({ 'message': 'terbarui' });
      }
    }
  );    
}

const deleteProject = async (req, res) => {
  const {projectid} = req.body;
  pool.query(
    'DELETE FROM project WHERE projectid = $1', [projectid],
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
  getProject,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
}