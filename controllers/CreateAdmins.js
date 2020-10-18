const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs')
const jsonwebtoken = require('jsonwebtoken')
const { validationResult } = require('express-validator')
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

exports.loginAdmin = async (req, res) => {

    const { body } = req

    const userLogin = await AdminCreateModel.findOne({ username: body.username });
    console.log('username->', body.username)
    if (!userLogin) {
        return res.status(400).json({ mensaje: 'Usuario y/o Contraseña Incorrectos' })
    }

    const passCheck = await bcryptjs.compare(body.password, userLogin.password);
    if (!passCheck) {
        return res.status(400).json({ mensaje: 'Usuario y/o Contraseña Incorrectos' })
    }

    const jwt_payload = {
        user: {
            id: userLogin.id,
            username: userLogin.username,
            role: userLogin.roleType
        }
    }

    try { 
        const token = jsonwebtoken.sign(jwt_payload, process.env.JWT_SECRET, { expiresIn: process.env.TIME_EXP })
        console.log('token ->', token);
        userLogin.token = [ token ] 
        await AdminCreateModel.update({ username: userLogin.username }, userLogin)
        console.log('userLogin->', userLogin.username);
        res.send({ mensaje: 'Logueado Correctamente', token,  role: userLogin.roleType, id: userLogin._id })
    } catch (error) {
        return res.status(500).json({ mensaje: 'ERROR', error })
    }
}