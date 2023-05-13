const express = require('express');
const router = express.Router();
const iotdataController = require('../controllers/iotdataController');

router.route('/')
    .get(iotdataController.getIotdata)
    .post(iotdataController.createIotdata)

router.route('/:varid/:devtime')
    .get(iotdataController.getIotdataWithFilter);

module.exports = router;
