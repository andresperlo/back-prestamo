const express = require('express');
const router = express.Router();
const authAdmin = require('../middleware/authAdmin');
const auth = require('../middleware/auth');

const Logout = require('../controllers/Logout');
const authLogout = require('../middleware/authLogout');

router.get('/',authLogout(['admin', 'seller']), Logout.Logout)

module.exports = router;
