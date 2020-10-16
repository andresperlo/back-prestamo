const bcryptjs = require('bcryptjs')
const { validationResult } = require('express-validator')
const jsonwebtoken = require('jsonwebtoken')
const AdminModel = require('../models/AdminModel');

exports.loginseller = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() })
    }

    const { body } = req

    const userLogin = await AdminModel.findOne({ usuarioVendedor: body.usuarioVendedor });
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
            usuarioVendedor: userLogin.usuarioVendedor,
            role: userLogin.roleType
        }
    }

    try {
        const token = jsonwebtoken.sign(jwt_payload, process.env.JWT_SECRET, { expiresIn: process.env.TIME_EXP })
        userLogin.token = [ token ] 
        await AdminModel.update({ usuarioVendedor: userLogin.usuarioVendedor }, userLogin)
        res.send({ mensaje: 'Logueado Correctamente', token,  role: userLogin.roleType, id: userLogin._id })
    } catch (error) {
        return res.status(500).json({ mensaje: 'ERROR', error })
    }
}
