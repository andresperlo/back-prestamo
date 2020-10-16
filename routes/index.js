const express = require('express');
const router = express.Router();

const FormRoutes = require('./seller.routes')
const AdminRoutes = require('./admin.routes')

router.use('/seller', FormRoutes)
router.use('/admin', AdminRoutes)

module.exports = router;
