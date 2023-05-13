const express = require('express');
const router = express.Router();
const dashwidgetController = require('../controllers/dashwidgetController');

router.route('/')
    .get(dashwidgetController.getDashwidget)
    .post(dashwidgetController.createDashwidget)
    .put(dashwidgetController.updateDashwidget)
    .delete(dashwidgetController.deleteDashwidget);

router.route('/:dashboardid')
    .get(dashwidgetController.getDashwidgetByDashId);

module.exports = router;
