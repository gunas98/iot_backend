const { logger } = require('./logEvents');

const errorHandler = (err, req, res, next) => {
    const timestamp = Date.now();
    logger.error(`${timestamp} ${err.message}`);
    //console.error(err.stack)
    res.status(500).send(err.message);

}

module.exports = errorHandler;