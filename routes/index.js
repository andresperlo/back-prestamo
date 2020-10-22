const express = require('express');
const router = express.Router();

const UniqueRoutes = require('./unique.routes')

router.use('/', UniqueRoutes)

module.exports = router;
