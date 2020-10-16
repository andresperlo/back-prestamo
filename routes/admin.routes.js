const express = require('express');
const { check } = require('express-validator')
const router = express.Router();

const CreateSeller = require('../controllers/RegisterSeller')
const GetAllSalesAdmin = require('../controllers/AllSalesAdmin')
const GetAllSellerAdmin = require('../controllers/AllSellerAdmin')
const SearchOneSeller = require('../controllers/SearchOneSeller')

router.post('/formadmin', [
    check('nombreVendedor', 'Campo Nombre del Vendedor Vacio').notEmpty(),
    check('apellidoVendedor', 'Campo lineaCredito Vació').notEmpty(),
    check('dniVendedor', 'Ingresar un tipOperacion Correcto').notEmpty(),
    check('direccionVendedor', 'Campo clienteNuevo Vacio').notEmpty(),
    check('celularVendedor', 'Campo nombreCliente Vacio').notEmpty(),
    check('emailVendedor', 'Campo dniCliente Vacio').notEmpty(),
    check('emailVendedor', 'Campo dniCliente Vacio').isEmail(),
    check('usuarioVendedor', 'Ingresar un celularCliente Correcto').notEmpty(),
    check('password', ' Campo Vacio. Contraseña').notEmpty(),
    check('password', 'la contraseña debe tener un mínimo de 8 caracteres').isLength({ min: 8 })
], CreateSeller.CreateSeller)

router.get('/allsalesadmin', GetAllSalesAdmin.getSalesAdmin)
router.get('/allselleradmin', GetAllSellerAdmin.getSellerAdmin)
router.get('/oneseller', SearchOneSeller.SearchOneSeller)



module.exports = router;
