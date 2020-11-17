const formData = require("express-form-data");
const express = require('express');
const { check } = require('express-validator')
const router = express.Router();
const authAdmin = require('../middleware/authAdmin');
const authAdminSeller = require('../middleware/authAdminSeller');

const Admin = require('../controllers/AdminSeller')

router.post('/login', [
    check('user', 'Ingresar un usuario Correcto').notEmpty(),
    check('password', ' Campo Vacio. Contraseña').notEmpty(),
    check('password', 'la contraseña debe tener un mínimo de 8 caracteres').isLength({ min: 8 })
], Admin.login)
router.post('/regadmin', [
    check('fullname', 'Campo Nombre del Vendedor Vacio').notEmpty(),
    check('dni', 'Ingresar un dni Correcto').notEmpty(),
    check('dni', 'Ingresar un dni Correcto').isLength({ max: 8 }),
    check('address', 'Campo direccion Vacio').notEmpty(),
    check('celphone', 'Campo celular Vacio').notEmpty(),
    check('email', 'Campo email Vacio').notEmpty(),
    check('email', 'Campo email Vacio').isEmail(),
    check('user', 'Ingresar un usuario Correcto').notEmpty(),
    check('password', ' Campo Vacio. Contraseña').notEmpty(),
    check('password', 'la contraseña debe tener un mínimo de 8 caracteres').isLength({ min: 8 })
], authAdmin('admin'), Admin.CreateAdmin)
router.post('/regseller', [
    check('fullname', 'Campo Nombre del Vendedor Vacio').notEmpty(),
    check('dni', 'Ingresar un dni Correcto').notEmpty(),
    check('dni', 'Ingresar un dni Correcto').isLength({ max: 8 }),
    check('address', 'Campo direccion Vacio').notEmpty(),
    check('celphone', 'Campo celular Vacio').notEmpty(),
    check('email', 'Campo email Vacio').notEmpty(),
    check('email', 'Campo email Vacio').isEmail(),
    check('user', 'Ingresar un usuario Correcto').notEmpty(),
    check('password', ' Campo Vacio. Contraseña').notEmpty(),
    check('password', 'la contraseña debe tener un mínimo de 8 caracteres').isLength({ min: 8 })
], authAdmin('admin'), Admin.CreateSeller)
router.post('/regsales', [
    check('fullname', 'Campo Nombre del Vendedor Vacio').notEmpty(),
    check('creditLine', 'Campo lineaCredito Vació').notEmpty(),
    check('typeOperation', 'Ingresar un tipOperacion Correcto').notEmpty(),
    check('newClient', 'Campo clienteNuevo Vacio').notEmpty(),
    check('nameClient', 'Campo nombreCliente Vacio').notEmpty(),
    check('dniClient', 'Campo dniCliente Vacio').notEmpty(),
    check('celphoneClient', 'Ingresar un celularCliente Correcto').notEmpty(),
    check('amountApproved', 'Campo Vacio. montoAprobado').notEmpty(),
    check('quotaAmount', ' Campo Vacio. cantidadCuota').notEmpty(),
    check('feeAmount', ' Campo Vacio. montoCuota').notEmpty(),
], authAdminSeller(['admin', 'seller']), Admin.CreateSales)
router.use(formData.parse());
// router.post('/regsales/:id/sendpdf', Admin.SendGmailer)

router.get('/allsales', authAdminSeller(['admin', 'seller']), Admin.getSalesAdmin)
router.get('/montosales', authAdminSeller(['admin', 'seller']), Admin.MontoSales)
router.get('/allseller', authAdmin('admin'), Admin.getSellerAdmin)
router.put('/salesupdate/:id', authAdmin('admin'), Admin.PutSales)
router.put('/salesdisenable/:id', authAdmin('admin'), Admin.SalesDis)
router.put('/salesenable/:id', authAdmin('admin'), Admin.SalesEn)
router.put('/sellerupdate/:id', authAdmin('admin'), Admin.PutSeller)
router.put('/sellerdisenable/:id', authAdmin('admin'), Admin.SellerDis)
router.put('/sellerenable/:id', authAdmin('admin'), Admin.SellerEn)
router.get('/logout', authAdminSeller(['admin', 'seller']), Admin.Logout)

module.exports = router;
