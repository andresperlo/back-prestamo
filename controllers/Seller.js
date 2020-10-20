const fs = require('fs')
const path = require('path')
const multer = require('multer')
let moment = require('moment'); // require
moment.locale('es')
const today = new Date().valueOf()
const month = moment().format('MMMM');
const year = moment().format('YYYY');
const SellerModel = require('../models/SellerModel');
const AdminModel = require('../models/AdminModel');
const sendNodeMail = require('../middleware/nodemailer');

exports.AltaForm = async (req, res) => {
    const { creditLine, typeOperation, newClient, nameClient, dniClient, celphoneClient,
        amountApproved, quotaAmount, feeAmount, saleDetail } = req.body

    const file = req.file
    const sellerName = res.locals.user.fullname

    const email = res.locals.user.email

    let userExists = await SellerModel.findOne({ dniClient });
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

    const SendPdf = {
        subject: 'Nueva Venta',
        msg: '¡Nueva Venta de ' + sellerName + '!',
        file: file,
        email: email
    }

    try {

        await usuario.save();
        await sendNodeMail(SendPdf.subject, SendPdf.msg, SendPdf.file, SendPdf.email)

        fs.unlink(path.join(__dirname, '..', file.path), err =>
        console.log('err', err))
        res.send({ mensaje: 'Tu Usuario se Registro Correctamente', user })
    } catch (error) {
        res.status(500).send(error);
    }
}


exports.getAllSales = async (req, res) => {

    try {

        let allSales = await SellerModel.find({ seller: res.locals.user.id })
        .populate('seller', 'fullname -_id')
        .select('-_id -sellerName')
        allSales = allSales.map(sale => {
            sale.date = moment((parseInt(sale.date))).format('YYYY-MM-DD')
            return sale
        })

        res.json({ allSales })

    } catch (err) {
        res.status(500).send(err);
    }
}

exports.GetUser = async (req, res) => {
    try {
        const { body } = req

        const user = await SellerModel.findOne({ dniClient: body.dniClient })
            .select('-_id -roleType -token -__v');

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

        const getSales = await SellerModel.find({ seller: res.locals.user.id });


        const GetDate = getSales.filter(getDate => {
            const date = moment((parseInt(getDate.date))).format('YYYY-MM-DD')
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

        const month = await SellerModel.find({ seller: res.locals.user.id })
            .select('-_id -roleType -token -__v');

        const GetMonth = month.filter(getMonth => {
            const Gmonth = moment(getMonth.Month).format('MMMM')
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

        const year = await SellerModel.find({ seller: res.locals.user.id })
            .select('-_id -roleType -token -__v');

        const GetYear = year.filter(getYear => {
            const Gyear = moment(getYear.year).format('YYYY')
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
        const seller = await AdminModel.findByIdAndUpdate(req.params.id, { enable: true }, { new: true })
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
