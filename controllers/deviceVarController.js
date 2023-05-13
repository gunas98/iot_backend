const pool = require('./dbconnect');
const ShortUniqueId = require('short-unique-id');
const uid = new ShortUniqueId({ length: 15 });
const { logger } = require('../middleware/logEvents');

const handleQueryError = (err, req, res) => {
  logger.error(`${err.message},\n                                       req: ${JSON.stringify(req.body)}`);
  res.status(500).json({ message: err.message });
};

const getDeviceVar = async (req, res) => {
    pool.query('SELECT * FROM devicevar ORDER BY varname ASC', (error, results) => {
        if (error) { 
            handleQueryError(error, req, res);  
        } else {
            res.status(200).json(results.rows);
        }
        
    });
};

const getDeviceVarByDevId = async (req, res) => {
    const devid = req.params.devid;
    pool.query('SELECT * FROM devicevar WHERE devid = $1 ORDER BY varname ASC',  [devid], (error, results) => {
        if (error) { 
            handleQueryError(error, req, res);  
        } else {
            res.status(200).json(results.rows);
        }
    });
};

const getDeviceVarByVar = async (req, res) => {
    const varid = req.params.varid;
    pool.query('SELECT * FROM devicevar WHERE varid = $1',  [varid], (error, results) => {
        if (error) { 
            handleQueryError(error, req, res);  
        } else {
            res.status(200).json(results.rows);
        }
    });
};


const createNewDeviceVar = async (req, res) => {
    const {devid, varname, vartype, varaccess, schedid, varformula} = req.body;
    const varid = uid();
    pool.query(
        'INSERT INTO devicevar (varid, devid, varname, vartype, varaccess, schedid, varformula, lastaccess) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())',
        [varid, devid, varname, vartype, varaccess, schedid, varformula],
        (error, results) => {
            if (error) { 
                handleQueryError(error, req, res);  
            } else {
                res.status(201).json({ 'message': `tersimpan`  });
            }
        }
    );
}

const updateDeviceVar = async (req, res) => {
    const {varid, vartype, varaccess, schedid, varformula} = req.body;
    pool.query(
        'UPDATE devicevar SET vartype = $2, varaccess=$3, schedid=$4, varformula=$5, lastaccess=NOW() WHERE varid = $1',
        [varid, vartype, varaccess, schedid, varformula],
        (error, results) => {
            if (error) { 
                handleQueryError(error, req, res);  
            } else {
                res.status(200).json({ 'message': 'terbarui' });
            }
        }
    );
}

const deleteDeviceVar = async (req, res) => {
    const {varid} = req.body;
    pool.query(
        'DELETE FROM devicevar WHERE varid = $1', [varid],
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
    getDeviceVar,
    getDeviceVarByDevId,
    getDeviceVarByVar,
    createNewDeviceVar,
    updateDeviceVar,
    deleteDeviceVar
}