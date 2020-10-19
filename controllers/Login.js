const bcryptjs = require('bcryptjs')
const { validationResult } = require('express-validator')
const jsonwebtoken = require('jsonwebtoken')
const AdminModel = require('../models/CreateAdminModel');
const SellerModel = require('../models/AdminModel');

exports.login = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() })
    }

    const { body } = req

    const AdminLogin = await AdminModel.findOne({ user: body.user }) 
    const SellerLogin = await SellerModel.findOne({ user: body.user });
    
    if (!AdminLogin && !SellerLogin) {
        return res.status(400).json({ mensaje: 'USUARIO y/o Contraseña Incorrectos' });
    }

    const passCheck = SellerLogin ? await bcryptjs.compare(body.password, SellerLogin.password) 
    :
    await bcryptjs.compare(body.password, AdminLogin.password)
    if (!passCheck) {
        return res.status(400).json({ mensaje: 'Usuario y/o CONTRASEÑA Incorrectos' })
    }

    const jwt_payload = {
        user: {
            id: AdminLogin ? AdminLogin.id : SellerLogin.id,
            user: AdminLogin ? AdminLogin.user : SellerLogin.user,
            role: AdminLogin ? AdminLogin.roleType : SellerLogin.roleType
        }
    }

    try {
        const token = jsonwebtoken.sign(jwt_payload, process.env.JWT_SECRET, { expiresIn: process.env.TIME_EXP })
        if (AdminLogin) {
            AdminLogin.token = [ token ] 
            await AdminModel.update({ user: AdminLogin.user }, AdminLogin)
            res.send({ mensaje: 'Logueado Correctamente', token,  role: AdminLogin.roleType, id: AdminLogin._id })
        } else {
            SellerLogin.token = [ token ]
            await SellerModel.update({ user: SellerLogin.user }, SellerLogin)
            res.send({ mensaje: 'Logueado Correctamente', token,  role: SellerLogin.roleType, id: SellerLogin._id })
        }
    } catch (error) {
        return res.status(500).json({ mensaje: 'ERROR', error })
    }
}
