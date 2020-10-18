const mongoose = require('mongoose');
let moment = require('moment'); // require
moment.locale('es')
const today = new Date().valueOf()
const month = moment().format('MMMM'); 
const year = moment().format('YYYY'); 
const bcryptjs = require('bcryptjs')
const { validationResult } = require('express-validator')
const jsonwebtoken = require('jsonwebtoken')
const SellerModel = require('../models/SellerModel');
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

exports.AltaForm = async (req, res) => {
  
    const {sellerName, creditLine, typeOperation, newClient, nameClient, dniClient,celphoneClient,amountApproved, quotaAmount, feeAmount, saleDetail} = req.body

    let userExists = await SellerModel.findOne({ dniClient});
    if (userExists) {
        return res.status(400).json({ mensaje: 'El Usuario ya existe' })
    }

    const user = {
        sellerName,
        creditLine,
        typeOperation,
        newClient,
        nameClient,
        dniClient,
        celphoneClient,
        amountApproved,
        quotaAmount,
        feeAmount,
        saleDetail,
        seller: res.locals.user.id,
        date: today.toString(),
        month: month,
        year: year,
        tokens: []
    };

    const usuario = new SellerModel(user);
    console.log('roletype', user.roleType)
    try {
        await usuario.save(); 
        res.send({ mensaje: 'Tu Usuario se Registro Correctamente', user })
    } catch (error) {
        res.status(500).send(error);
    }
}


exports.getSales = async (req, res) => {

    try {

        const allSales = await SellerModel.find({ seller: res.locals.user.id})
        .populate('seller', '-_id, fullname')
        .select('-_id -__v')
        
        res.send(allSales)
        console.log('allSales ->',allSales)
    } catch (err) {
        res.status(500).send(err);
    }
}

exports.GetUser = async (req, res) => {
    try {
        const { body } = req

        const user = await SellerModel.findOne({ dniClient: body.dniClient }).select('-_id -roleType -token -__v');
        if (!user) {
            return res.status(400).json({ mensaje: 'No se encuentra el DNI en la base de datos' })
        }
        res.send(user)
    } catch (err) {
        res.status(500).send(err);
    }
}

exports.GetOneDate = async (req, res) => {
    try {
        const { body } = req
        
        const getSales = await SellerModel.find({seller: res.locals.user.id});


        const GetDate = getSales.filter(getDate => {
            const date = moment((parseInt(getDate.date))).format('YYYY-MM-DD')
            console.log('date->', date, 'body.date ->', body.date);
            return date == body.date
        })

        if (!getSales.length) {
            return res.status(400).json({ mensaje: 'No se encuentra la fecha en la base de datos' })
        }

        res.send(GetDate)
    } catch (err) {
        res.status(500).send(err);
    }
}

exports.GetMonth = async (req, res) => {
    try {
        const { body } = req

        const month = await SellerModel.find({ seller: res.locals.user.id }).select('-_id -roleType -token -__v');

        const GetMonth = month.filter(getMonth => {
            const Gmonth = moment(getMonth.Month).format('MMMM')
            console.log('Month->', Gmonth, 'body.Month ->', body.month);
            return Gmonth == body.month
        })

        if (!month) {
            return res.status(400).json({ mensaje: 'No se encuentra la fecha en la base de datos' })
        }
        res.send(GetMonth)
    } catch (err) {
        res.status(500).send(err);
    }
}

exports.GetYear = async (req, res) => {
    try {
        const { body } = req

        const year = await SellerModel.find({ seller: res.locals.user.id }).select('-_id -roleType -token -__v');

        const GetYear = year.filter(getYear => {
            const Gyear = moment(getYear.year).format('YYYY')
            console.log('year->', Gyear, 'body.year ->', body.year);
            return Gyear == body.year
        })

        if (!year) {
            return res.status(400).json({ mensaje: 'No se encuentra la fecha en la base de datos' })
        }
        res.send(GetYear)
    } catch (err) {
        res.status(500).send(err);
    }
}

exports.SellerEn = async (req, res) => {

    try {        
        const seller = await AdminModel.findByIdAndUpdate(req.params.id, {enable:true}, { new: true })
        res.send(seller)
    } catch (err) {
        res.status(500).send(err);
    }
}

exports.LogoutSeller = async (req, res) => {
    try {

       await AdminModel.updateOne({ _id: res.locals.user.id }, { $set: { token: [] } })
       res.json({ mensaje: 'Deslogueo ok' })
   } catch (error) {
       res.status(500).send({ mensaje: 'Error', error })
   }
} 
