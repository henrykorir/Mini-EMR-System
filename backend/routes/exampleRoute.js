// routes/authRoutes.js

const express = require('express');
const router = express.Router();
const sumController = require('../controllers/exampleController');

router.get('/sum', sumController.getSum);


module.exports = router;
