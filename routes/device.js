const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');

router.route('/')
    .get(deviceController.getDevice)
    .post(deviceController.createNewDevice)
    .put(deviceController.updateDevice)
    .delete(deviceController.deleteDevice);

router.route('/:devid')
    .get(deviceController.getDeviceByDevId);

module.exports = router;
