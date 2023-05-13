const express = require('express');
const router = express.Router();
const projectsController = require('../controllers/projectController');

router.route('/')
    .get(projectsController.getProject)
    .post(projectsController.createProject)
    .put(projectsController.updateProject)
    .delete(projectsController.deleteProject);

router.route('/:devid')
    .get(projectsController.getProjectById);

module.exports = router;
