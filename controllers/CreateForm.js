let moment = require('moment'); // require
moment.locale('es')
const today = moment().format('DD/MM/YYYY'); 
const month = moment().format('MMMM'); 
const year = moment().format('YYYY'); 
const FormModel = require('../models/PrestamosModel');
/* const sendNodeMail = require('../../middlewares/nodemailer'); */

exports.AltaForm = async (req, res) => {
  
    const {nombreVendedor, lineaCredito, tipOperacion, clienteNuevo, nombreCliente, dniCliente,celularCliente,montoAprobado, cantidadCuota, montoCuota, detalleVenta} = req.body

    let userExists = await FormModel.findOne({ dniCliente});
    if (userExists) {
        return res.status(400).json({ mensaje: 'El Usuario ya existe' })
    }

    const user = {
        nombreVendedor,
        lineaCredito,
        tipOperacion,
        clienteNuevo,
        nombreCliente,
        dniCliente,
        celularCliente,
        montoAprobado,
        cantidadCuota,
        montoCuota,
        detalleVenta,
        seller: res.locals.user.id,
        date: today,
        month: month,
        year: year,
        tokens: []
    };

    const usuario = new FormModel(user);
    console.log('roletype', user.roleType)
    try {
        await usuario.save(); 
        res.send({ mensaje: 'Tu Usuario se Registro Correctamente', user })
    } catch (error) {
        res.status(500).send(error);
    }
}