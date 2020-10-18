const express = require('express');
const { check } = require('express-validator')
const router = express.Router();

const Admin = require('../controllers/Admin')
const CreateAdmin = require('../controllers/CreateAdmins')

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
], Admin.CreateSeller)

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
], CreateAdmin.CreateAdmin)

router.get('/allsalesadmin', Admin.getSalesFalseAdmin)
router.get('/allsalesfalseadmin', Admin.getSalesFalseAdmin)
router.get('/allselleradmin', Admin.getSellerAdmin)
router.get('/allsellerfalseadmin', Admin.getSalesFalseAdmin)
router.get('/oneseller', Admin.SearchOneSeller)
router.get('/onesale/:id', Admin.SearchOneSale)

router.get('/salestoday', Admin.GetOneDate)
router.get('/salesmonth', Admin.GetMonth)
router.get('/salesyear', Admin.GetYear)

/* ventas */
router.put('/salesupdate/:id', Admin.PutSales)
router.put('/salesdisenable/:id', Admin.SalesDis)
router.put('/salesenable/:id', Admin.SalesEn)
/* vendedores */
router.put('/sellerupdate/:id', Admin.PutSeller)
router.put('/sellerdisenable/:id', Admin.SellerDis)
router.put('/sellerenable/:id', Admin.SellerEn)

module.exports = router;
