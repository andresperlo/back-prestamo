const {upload} = require('../middleware/upload')
const express = require('express');
const { check } = require('express-validator')
const router = express.Router();
const auth = require('../middleware/auth');


const Seller = require('../controllers/Seller')
console.log('uploadRoutes ->', upload)
router.post('/formseller',upload.single('myFile'), [
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
], auth('seller'), Seller.AltaForm)

router.get('/checkdni', auth('seller'), [
    check('dniCliente', 'Campo dniCliente Vacio').notEmpty(),
], Seller.GetUser)

router.get('/onedate', auth('seller'), Seller.GetOneDate)
router.get('/onemonth', auth('seller'), Seller.GetMonth)
router.get('/oneyear', auth('seller'), Seller.GetYear)

router.get('/allsales', auth('seller'), Seller.getAllSales)
router.get('/logout', auth('seller'), Seller.LogoutSeller)

module.exports = router;
