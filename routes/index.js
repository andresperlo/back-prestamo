const express = require('express');
const router = express.Router();

const FormRoutes = require('./seller.routes')
const AdminRoutes = require('./admin.routes')
const LoginRoutes = require('./login.routes')
const LogoutRoutes = require('./logout.routes')

router.use('/seller', FormRoutes)
router.use('/admin', AdminRoutes)
router.use('/login', LoginRoutes)
router.use('/logout', LogoutRoutes)

module.exports = router;
