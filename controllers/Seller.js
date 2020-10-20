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
    console.log('reqFile ->', req.file)
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

    console.log('user ->', user.file);

    const usuario = new SellerModel(user);
    console.log('usuario ->', usuario)

    const SendPdf = {
        subject: 'Nueva Venta',
        msg: '¡Nueva Venta de ' + sellerName + '!',
        file: file,
        email: email
    }

    try {

        /*  await usuario.save();  */
        await sendNodeMail(SendPdf.subject, SendPdf.msg, SendPdf.file, SendPdf.email)
        fs.unlink(path.join(__dirname, '..', file.path), err =>
            console.log('err', err))
        res.send({ mensaje: 'Venta Cargada Correctamente', user })
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
            sale.date = moment((parseInt(sale.date))).format('DD-MM-YYYY')
            return sale
        })

        res.send({ allSales })

    } catch (err) {
        console.log('err', err)
        res.status(500).send(err);

    }
}

exports.GetUserDni = async (req, res) => {
    try {
        const { body } = req

        let client = await SellerModel.findOne({ dniClient: body.dniClient })
            .populate('seller', 'fullname -_id')
            .select('-_id -roleType -token -__v');

            client.date = moment((parseInt(client.date))).format('DD-MM-YYYY')
        

        if (!client) {
            return res.status(400).json({ mensaje: 'No se encuentra el DNI en la base de datos' })
        }
        res.send(client)
    } catch (err) {
        console.log(err)
        res.status(500).send(err);
    }
}

exports.GetOneDate = async (req, res) => {
    try {
        const { body } = req

        const getSales = await SellerModel.find({ seller: res.locals.user.id });

        let GetDate = getSales.filter(getDate => {
            const date = moment((parseInt(getDate.date))).format('DD-MM-YYYY')
            console.log('date->', date, 'body.date ->', body.date);
            return date == body.date
        })

        GetDate = GetDate.map(oneDate => {
            oneDate.date = moment((parseInt(oneDate.date))).format('DD-MM-YYYY')
            return oneDate
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

        const year = await SellerModel.find({ seller: res.locals.user.id })
            .select('-_id -roleType -token -__v');

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
