const express = require('express');
const { check } = require('express-validator')
const router = express.Router();

const Login = require('../controllers/Login')

router.post('/', [
    check('user', 'Ingresar un usuario Correcto').notEmpty(),
    check('password', ' Campo Vacio. Contraseña').notEmpty(),
    check('password', 'la contraseña debe tener un mínimo de 8 caracteres').isLength({ min: 8 })
], Login.login)

module.exports = router;
