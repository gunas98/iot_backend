const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');

router.route('/')
    .get(scheduleController.getSchedule)
    .post(scheduleController.createSchedule)
    .put(scheduleController.updateSchedule)
    .delete(scheduleController.deleteSchedule);

router.route('/:devid')
    .get(scheduleController.getScheduleById);

module.exports = router;
