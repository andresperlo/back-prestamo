const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs')
const AdminCreateModel = require('../models/CreateAdminModel');

exports.CreateAdmin = async (req, res) => {
    
    const {fullname, dni, address, celphone, email, username, password} = req.body

    let userExists = await AdminCreateModel.findOne({ dni });
    if (userExists) {
        return res.status(400).json({ mensaje: 'El Administrador ya existe' })
    }

    let mailExists = await AdminCreateModel.findOne({ email });
    if (mailExists) {
        console.log(mailExists)
        return res.status(400).json({ mensaje: 'El Administrador ya existe' })
    }

    const admin = {
        fullname,
        dni,
        address,
        celphone,
        email,
        username,
        tokens: []
    };

    const salt = await bcryptjs.genSalt(10);
    admin.password = await bcryptjs.hash(password, salt);

    const usuario = new AdminCreateModel(admin);
   
    try {
        await usuario.save(); 
        res.send({ mensaje: 'Tu Administrador se Registro Correctamente', admin })
    } catch (error) {
        res.status(500).send(error);
    }
}