const pool = require('./dbconnect');
const { logger } = require('../middleware/logEvents');

const handleQueryError = (err, req, res) => {
  logger.error(`${err.message},\n                                       req: ${JSON.stringify(req.body)}`);
  res.status(500).json({ message: err.message });
};

const getWidgetType = async (req, res) => {
  pool.query('SELECT * FROM widgettype', (error, results) => {
    if (error) { 
      handleQueryError(error, req, res);
    } else {
      res.status(200).json(results.rows);
    }
    
  });
};

const getWidgetTypeById = async (req, res) => {
  const widgettypeid = req.params.widgettypeid;
  pool.query('SELECT * FROM widgettype WHERE widgettypeid = $1',  [widgettypeid], (error, results) => {
    if (error) {  
      handleQueryError(error, req, res);  
    } else {
      res.status(200).json(results.rows);
    }
  });
};

const createWidgetType = async (req, res) => {
  const {widgettypeid, widgettypename , datatype } = req.body;
  pool.query(
    'INSERT INTO widgettype (widgettypeid, widgettypename, datatype, lastaccess) VALUES ($1, $2, $3, NOW())',
    [widgettypeid, widgettypename, datatype],
    (error, results) => { 
      if (error) {
        throw error; 
      } else {
        res.sendStatus(201);
      }
                          
    }
  );
}


const updateWidgetType = async (req, res) => {
  const {widgettypeid, widgettypename, datatype} = req.body;
  pool.query(
    'UPDATE widgettype SET widgettypename = $2, datatype = $3, lastaccess = NOW() WHERE widgettypeid = $1',
    [widgettypeid, widgettypename, datatype],
    (error, results) => {
      if (error) { 
        handleQueryError(error, req, res);   
      } else {
        res.sendStatus(200);
      }
    }
  );
}

const deleteWidgetType = async (req, res) => {
  const {widgettypeid} = req.body;
  pool.query(
    'DELETE FROM widgettype WHERE widgettypeid = $1', [widgettypeid],
    (error, results) => {
      if (error) { 
        handleQueryError(error, req, res);
      } else {
        res.sendStatus(200);
      }
    }
  );
};

module.exports = {
  getWidgetType,
  getWidgetTypeById,
  createWidgetType,
  updateWidgetType,
  deleteWidgetType
}