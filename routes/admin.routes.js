const express = require('express');
const { check } = require('express-validator')
const router = express.Router();
const authAdmin = require('../middleware/authAdmin');

const Admin = require('../controllers/Admin')
const CreateAdmin = require('../controllers/CreateAdmins')

router.post('/login', [
    check('username', 'Ingresar un usuario Correcto').notEmpty(),
    check('password', ' Campo Vacio. Contraseña').notEmpty(),
    check('password', 'la contraseña debe tener un mínimo de 8 caracteres').isLength({ min: 8 })
], CreateAdmin.loginAdmin)

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
],authAdmin('admin'), Admin.CreateSeller)

router.post('/regadmin', [
    check('fullname', 'Campo Nombre del Vendedor Vacio').notEmpty(),
    check('dni', 'Ingresar un dni Correcto').notEmpty(),
    check('dni', 'Ingresar un dni Correcto').isLength({ max: 8 }),
    check('address', 'Campo direccion Vacio').notEmpty(),
    check('celphone', 'Campo celular Vacio').notEmpty(),
    check('email', 'Campo email Vacio').notEmpty(),
    check('email', 'Campo email Vacio').isEmail(),
    check('username', 'Ingresar un usuario Correcto').notEmpty(),
    check('password', ' Campo Vacio. Contraseña').notEmpty(),
    check('password', 'la contraseña debe tener un mínimo de 8 caracteres').isLength({ min: 8 })
],authAdmin('admin'), CreateAdmin.CreateAdmin)

router.get('/allsales',authAdmin('admin'), Admin.getSalesAdmin)
router.get('/allsalesfalse',authAdmin('admin'), Admin.getSalesFalseAdmin)
router.get('/allseller',authAdmin('admin'), Admin.getSellerAdmin)
router.get('/allsellerfalse',authAdmin('admin'), Admin.getSellerAdmin)
router.get('/oneseller',authAdmin('admin'), Admin.SearchOneSeller)
router.get('/onesale/:id',authAdmin('admin'), Admin.SearchOneSale)
router.get('/onesaledni',authAdmin('admin'), Admin.GetUserDni)


router.get('/salestoday',authAdmin('admin'), Admin.GetOneDate)
router.get('/salesmonth',authAdmin('admin'), Admin.GetMonth)
router.get('/salesyear',authAdmin('admin'), Admin.GetYear)

/* ventas */
router.put('/salesupdate/:id',authAdmin('admin'), Admin.PutSales)
router.put('/salesdisenable/:id',authAdmin('admin'), Admin.SalesDis)
router.put('/salesenable/:id',authAdmin('admin'), Admin.SalesEn)
/* vendedores */
router.put('/sellerupdate/:id',authAdmin('admin'), Admin.PutSeller)
router.put('/sellerdisenable/:id',authAdmin('admin'), Admin.SellerDis)
router.put('/sellerenable/:id',authAdmin('admin'), Admin.SellerEn)

router.get('/logout',authAdmin('admin'), CreateAdmin.LogoutAdmin)

module.exports = router;
