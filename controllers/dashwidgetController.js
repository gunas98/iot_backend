const pool = require('./dbconnect');
const ShortUniqueId = require('short-unique-id');
const uid = new ShortUniqueId({ length: 15 });
const { logger } = require('../middleware/logEvents');

const handleQueryError = (err, req, res) => {
  logger.error(`${err.message},\n                                       req: ${JSON.stringify(req.body)}`);
  res.status(500).json({ message: err.message });
};

const getDashwidget = async (req, res) => {
    pool.query('SELECT * FROM dashwidget ORDER BY dashboardid ASC', (error, results) => {
        if (error) { 
            handleQueryError(error, req, res); 
        } else {
            res.status(200).json(results.rows);
        }
    });
};

const getDashwidgetByDashId = async (req, res) => {
    const dashboardid = req.params.dashboardid;
    pool.query('SELECT * FROM dashwidget WHERE dashboardid = $1',  [dashboardid], (error, results) => {
        if (error) {  
            handleQueryError(error, req, res);
        } else {
            res.status(200).json(results.rows);
        }
    });
};


const createDashwidget = async (req, res) => {
    console.log(res);
    const {dashboardid, widgettypeid, varid, title, posx1, posy1, posx2, posy2, textcolor } = req.body;
    const widgetid = uid();
    pool.query(
        'INSERT INTO dashwidget (dashboardid, widgetid, widgettypeid, varid, title, posx1, posy1, posx2, posy2, textcolor, lastaccess) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())',
        [dashboardid, widgetid, widgettypeid, varid, title, posx1, posy1, posx2, posy2, textcolor],
        (error, results) => { 
                                if (error) {
                                    handleQueryError(error, req, res); 
                                } else {
                                    res.status(201).json({ 'widgetid': widgetid});
                                }
                            }
    );
}

const updateDashwidget = async (req, res) => {
    const {dashboardid, widgetid, widgettypeid, varid, title, posx1, posy1, posx2, posy2, textcolor} = req.body;
    pool.query(
        'UPDATE dashwidget SET widgettypeid = $3, varid = $4, title = $5, posx1 = $6, posy1 = $7, posx2 = $8, posy2 = $9, textcolor = $10, lastaccess = NOW() WHERE dashboardid = $1 AND widgetid = $2',
        [dashboardid, widgetid, widgettypeid, varid, title, posx1, posy1, posx2, posy2, textcolor],
        (error, results) => {
            if (error) { 
                handleQueryError(error, req, res);   
            } else {
                res.sendStatus(200);
            }
        }
    );
}

const deleteDashwidget = async (req, res) => {
    const {dashboardid, widgetid} = req.body;
    pool.query(
        'DELETE FROM dashwidget WHERE WHERE dashboardid = $1 AND widgetid = $2 ', [dashboardid, widgetid],
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
  getDashwidget,
  getDashwidgetByDashId,
  createDashwidget,
  updateDashwidget,
  deleteDashwidget
}