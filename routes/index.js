const express = require('express');
const router = express.Router();

const FormRoutes = require('./seller.routes')
const AdminRoutes = require('./admin.routes')
const LoginRoutes = require('./login.routes')

router.use('/seller', FormRoutes)
router.use('/admin', AdminRoutes)
router.use('/login', LoginRoutes)

module.exports = router;
