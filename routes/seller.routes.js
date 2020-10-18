const express = require('express');
const { check } = require('express-validator')
const router = express.Router();
const auth = require('../middleware/auth');

const Seller = require('../controllers/Seller')

router.post('/formseller', auth('seller'), [
    check('sellername', 'Campo Nombre del Vendedor Vacio').notEmpty(),
    check('creditLine', 'Campo lineaCredito Vació').notEmpty(),
    check('typeOperation', 'Ingresar un tipOperacion Correcto').notEmpty(),
    check('newClient', 'Campo clienteNuevo Vacio').notEmpty(),
    check('nameClient', 'Campo nombreCliente Vacio').notEmpty(),
    check('dniClient', 'Campo dniCliente Vacio').notEmpty(),
    check('celphoneClient', 'Ingresar un celularCliente Correcto').notEmpty(),
    check('amountApproved', 'Campo Vacio. montoAprobado').notEmpty(),
    check('quotaAmount', ' Campo Vacio. cantidadCuota').notEmpty(),
    check('feeAmount', ' Campo Vacio. montoCuota').notEmpty(),
    check('saleDetail', ' Campo Vacio. detalleVenta').notEmpty(),
], Seller.AltaForm)

router.post('/login', [
    check('user', 'Ingresar un usuario Correcto').notEmpty(),
    check('password', ' Campo Vacio. Contraseña').notEmpty(),
    check('password', 'la contraseña debe tener un mínimo de 8 caracteres').isLength({ min: 8 })
], Seller.loginseller)

router.get('/checkdni', auth('seller'), [
    check('dniCliente', 'Campo dniCliente Vacio').notEmpty(),
], Seller.GetUser)

router.get('/onedate', auth('seller'), Seller.GetOneDate)
router.get('/onemonth', auth('seller'), Seller.GetMonth)
router.get('/oneyear', auth('seller'), Seller.GetYear)

router.get('/allsales', auth('seller'), Seller.getSales)
router.get('/logout', auth('seller'), Seller.LogoutSeller)

module.exports = router;
