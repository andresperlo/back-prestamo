const bcryptjs = require('bcryptjs')
const AdminModel = require('../models/AdminModel');

/* const sendNodeMail = require('../../middlewares/nodemailer'); */

exports.CreateSeller = async (req, res) => {
  
    const { body } = req

    let nombreVendedor = ({ name: body.nombreVendedor })
    let apellidoVendedor = ({ lastname: body.apellidoVendedor })
    let dniVendedor = ({phonenumber: body.dniVendedor})
    let direccionVendedor = ({address: body.direccionVendedor})
    let celularVendedor = ({ email: body.celularVendedor })
    let emailVendedor = ({ email: body.emailVendedor })
    let usuarioVendedor = ({ email: body.usuarioVendedor })

    let userExists = await AdminModel.findOne({ dniVendedor: body.dniVendedor });
    if (userExists) {
        return res.status(400).json({ mensaje: 'El Usuario ya existe' })
    }

    let mailExists = await AdminModel.findOne({ emailVendedor: body.emailVendedor });
    if (mailExists) {
        console.log(mailExists)
        return res.status(400).json({ mensaje: 'El Usuario ya existe' })
    }

    const user = {
        nombreVendedor: body.nombreVendedor,
        apellidoVendedor: body.apellidoVendedor,
        dniVendedor: body.dniVendedor,
        direccionVendedor: body.direccionVendedor,
        celularVendedor: body.celularVendedor,
        emailVendedor: body.emailVendedor,
        usuarioVendedor: body.usuarioVendedor,
        tokens: []
    };

    const salt = await bcryptjs.genSalt(10);
    user.password = await bcryptjs.hash(body.password, salt);

    const usuario = new AdminModel(user);
   
    try {
        await usuario.save(); 
        res.send({ mensaje: 'Tu Usuario se Registro Correctamente', user })
    } catch (error) {
        res.status(500).send(error);
    }
}