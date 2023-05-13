const express = require('express');
const router = express.Router();
const generateController = require('../controllers/generateCode');

router.route('/')
    .post(generateController.generateCode);
    

module.exports = router;
