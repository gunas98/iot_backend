const express = require('express');
const router = express.Router();
const dashdevicesController = require('../controllers/dashdeviceController');

router.route('/')
    .get(dashdevicesController.getDashdevice)
    .post(dashdevicesController.createDashdevice)
    .put(dashdevicesController.updateDashdevice)
    .delete(dashdevicesController.deleteDashdevice);

router.route('/:devid')
    .get(dashdevicesController.getDashdeviceById);

module.exports = router;
