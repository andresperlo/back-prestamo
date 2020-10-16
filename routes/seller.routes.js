const express = require('express');
const { check } = require('express-validator')
const router = express.Router();
const auth = require('../middleware/auth');

const VendedorForm = require('../controllers/CreateForm')
const CheckClient = require('../controllers/CheckClient')
const LoginSeller = require('../controllers/LoginVendedor')
const LogoutSeller = require('../controllers/LogoutSeller');
const GetAllSales = require('../controllers/AllSales');
const GetOneDate = require('../controllers/GetOneDate');
const GetOneMonth = require('../controllers/GetOneMonth');
const GetOneYear = require('../controllers/GetOneYear');

router.post('/formseller', auth('vendedor'), [
    check('nombreVendedor', 'Campo Nombre del Vendedor Vacio').notEmpty(),
    check('lineaCredito', 'Campo lineaCredito Vació').notEmpty(),
    check('tipOperacion', 'Ingresar un tipOperacion Correcto').notEmpty(),
    check('clienteNuevo', 'Campo clienteNuevo Vacio').notEmpty(),
    check('nombreCliente', 'Campo nombreCliente Vacio').notEmpty(),
    check('dniCliente', 'Campo dniCliente Vacio').notEmpty(),
    check('celularCliente', 'Ingresar un celularCliente Correcto').notEmpty(),
    check('montoAprobado', 'Campo Vacio. montoAprobado').notEmpty(),
    check('cantidadCuota', ' Campo Vacio. cantidadCuota').notEmpty(),
    check('montoCuota', ' Campo Vacio. montoCuota').notEmpty(),
    check('detalleVenta', ' Campo Vacio. detalleVenta').notEmpty(),
], VendedorForm.AltaForm)

router.post('/login', [
    check('usuarioVendedor', 'Ingresar un celularCliente Correcto').notEmpty(),
    check('password', ' Campo Vacio. Contraseña').notEmpty(),
    check('password', 'la contraseña debe tener un mínimo de 8 caracteres').isLength({ min: 8 })
], LoginSeller.loginseller)

router.get('/checkdni', auth('vendedor'), [
    check('dniCliente', 'Campo dniCliente Vacio').notEmpty(),
], CheckClient.GetUser)

router.get('/onedate', auth('vendedor'), GetOneDate.GetOneDate)
router.get('/onemonth', auth('vendedor'), GetOneMonth.GetMonth)
router.get('/oneyear', auth('vendedor'), GetOneYear.GetYear)

router.get('/logout', auth('vendedor'), LogoutSeller.LogoutSeller)
router.get('/allsales', auth('vendedor'), GetAllSales.getSales)

module.exports = router;
