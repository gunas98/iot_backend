const express = require('express');
const router = express.Router();
const widgetTypeController = require('../controllers/widgettypeController');

router.route('/')
    .get(widgetTypeController.getWidgetType)
    .post(widgetTypeController.createWidgetType)
    .put(widgetTypeController.updateWidgetType)
    .delete(widgetTypeController.deleteWidgetType);

router.route('/:devid')
    .get(widgetTypeController.getWidgetTypeById);

module.exports = router;
