const fs = require('fs')
const path = require('path')
const { validationResult } = require('express-validator')
const multer = require('multer')
let moment = require('moment'); // require
moment.locale('es')
const today = moment().format('DD/MM/YYYY');
const month = moment().format('MMMM/YYYY');
const year = moment().format('YYYY');
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs')
const jsonwebtoken = require('jsonwebtoken')
const SellerModel = require('../models/SellerModel');
const AdminModel = require('../models/AdminModel');
const AdminCreateModel = require('../models/CreateAdminModel');
const sendNodeMail = require('../middleware/nodemailer');

exports.login = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() })
    }

    const { body } = req

    const AdminLogin = await AdminCreateModel.findOne({ user: body.user })
    const SellerLogin = await AdminModel.findOne({ user: body.user });

    if (!AdminLogin && !SellerLogin) {
        return res.status(400).json({ mensaje: 'USUARIO y/o Contraseña Incorrectos' });
    }
    console.log('sellerlogin', SellerLogin)
    console.log('adminLogin', AdminLogin)

    if (AdminLogin) {
        if (AdminLogin.enable !== true) {
            return res.status(400).json({ mensaje: 'USUARIO y/o Contraseña Incorrectos' });
        }
    }

    if (SellerLogin) {
        if (SellerLogin.enable !== true) {
            return res.status(400).json({ mensaje: 'USUARIO y/o Contraseña Incorrectos' });
        }
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
            AdminLogin.token = [token]
            await AdminCreateModel.update({ user: AdminLogin.user }, AdminLogin)
            res.send({ mensaje: 'Logueado Correctamente', token, role: AdminLogin.roleType, id: AdminLogin._id })
        } else {
            SellerLogin.token = [token]
            await AdminModel.update({ user: SellerLogin.user }, SellerLogin)
            res.send({ mensaje: 'Logueado Correctamente', token, role: SellerLogin.roleType, id: SellerLogin._id })
        }

        console.log('token ->', token)

    } catch (error) {
        return res.status(500).json({ mensaje: 'ERROR', error })
    }
}

exports.CreateAdmin = async (req, res) => {

    const { fullname, dni, address, celphone, email, username, password } = req.body

    let userExists = await AdminCreateModel.findOne({ dni });
    if (userExists) {
        return res.status(400).json({ mensaje: 'El Administrador ya existe' })
    }

    let mailExists = await AdminCreateModel.findOne({ email });
    if (mailExists) {
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

exports.CreateSeller = async (req, res) => {

    const { fullname, dni, address, celphone, email, user, password } = req.body

    let userExists = await AdminModel.findOne({ dni });
    if (userExists) {
        return res.status(400).json({ mensaje: 'El Usuario ya existe' })
    }

    let mailExists = await AdminModel.findOne({ email });
    if (mailExists) {
        return res.status(400).json({ mensaje: 'El Usuario ya existe' })
    }

    const users = {
        fullname,
        dni,
        address,
        celphone,
        email,
        user,
        tokens: []
    };

    const salt = await bcryptjs.genSalt(10);
    users.password = await bcryptjs.hash(password, salt);

    const usuario = new AdminModel(users);

    try {
        await usuario.save();
        res.send({ mensaje: 'Tu Usuario se Registro Correctamente', users })
    } catch (error) {
        res.status(500).send(error);
    }
}

exports.CreateSales = async (req, res) => {
    console.log('reqFile ->', req.file)
    const { creditLine, typeOperation, newClient, nameClient, dniClient, celphoneClient,
        amountApproved, quotaAmount, feeAmount, saleDetail } = req.body

    const file = req.file
    const sellerName = req.body.sellerName ? req.body.sellerName : res.locals.user.fullname
    const email = res.locals.user.email

    const userExists = await SellerModel.findOne({ dniClient });

    if (!userExists) {

        CreateSalesUser = {
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
            date: today,
            month: month,
            year: year,
            tokens: []
        };
    }

    if (userExists) {
        if (userExists.quotaAmount > 3) {

            fs.unlink(path.join(__dirname, '..', file.path), err =>
                console.log('err', err))
            return res.status(400).json({ mensaje: 'No puede tener el prestamo. Cuota mayor a 3' })
        } else {

            CreateSalesUser = {
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
                date: today,
                month: month,
                year: year,
                tokens: []
            };

        }
    }

    console.log('user ->', CreateSalesUser.file);
    const usuario = new SellerModel(CreateSalesUser);
    console.log('usuario ->', usuario)
    await usuario.save();


    const SendPdf = {
        subject: 'Nueva Venta',
        msg: '¡Nueva Venta de ' + sellerName + '!',
        file: file,
        email: email
    }

    try {

        await sendNodeMail(SendPdf.subject, SendPdf.msg, SendPdf.file, SendPdf.email)
        fs.unlink(path.join(__dirname, '..', file.path), err =>
            console.log('err', err))
        res.send({ mensaje: 'Venta Cargada Correctamente', CreateSalesUser })
    } catch (error) {
        console.log('error de regsales ->', error)
        res.status(500).send(error);
    }
}

exports.getSalesAdmin = async (req, res) => {

    const role = res.locals.user.roleType
    console.log('role', role)
    try {
        if (role == 'admin') {

            const allSales = await SellerModel.find({ enable: true }).select('-__v')

            res.send(allSales)
        } else if (role == 'seller') {

            const allSales = await SellerModel.find({ seller: res.locals.user.id, enable: true })
                .populate('seller', 'fullname ')
                .select(' -sellerName')

            res.send(allSales)
        }
    } catch (err) {
        res.status(500).send(err);
    }
}

exports.getSalesFalseAdmin = async (req, res) => {

    try {

        const allSalesFalse = await SellerModel.find({ enable: false }).select('-__v')

        res.send(allSalesFalse)
    } catch (err) {
        res.status(500).send(err);
    }
}

exports.GetUserDni = async (req, res) => {
    try {
        const { body } = req

        const user = await SellerModel.find({ dniClient: body.dniClient }).select('-roleType -token -__v');

        if (!user) {
            return res.status(400).json({ mensaje: 'No se encuentra el DNI en la base de datos' })
        }
        res.send(user)
    } catch (err) {
        res.status(500).send(err);
    }
}

exports.SearchOneSale = async (req, res) => {
    try {

        const sale = await SellerModel.findById(req.params.id)
            .populate('seller', '-_id fullname')
            .select('-roleType -token -__v -month -year');

        if (!sale) {
            return res.status(400).json({ mensaje: 'No se encuentra al Vendedor en la base de datos' })
        }
        res.send(sale)
    } catch (err) {
        res.status(500).send(err);
    }
}

exports.GetMonth = async (req, res) => {

    const mes = moment().format('MMMM/YYYY');
    console.log('mes actual ->', mes)

    try {

        let sales = await SellerModel.find({ seller: res.locals.user.id, month: mes })
            .populate('seller', 'fullname')
            .select('-roleType -token -__v');

        sales = sales.map(sale => {
            sale.enable = true
            return sale
        })

        if (!sales.length) {
            return res.status(400).json({ mensaje: 'No se encuentra la fecha en la base de datos' })
        }
        res.send(sales)

    } catch (err) {
        console.log('error de GetMonth', err)
        res.status(500).send(err);
    }
}

exports.SearchOneMonth = async (req, res) => {

    const role = res.locals.user.roleType
    const { body } = req

    try {
        if (role == 'admin') {

            const month = await SellerModel.find({ month: body.month, enable: true }).select('-roleType -token -__v');

            if (!month) {
                return res.status(400).json({ mensaje: 'No se encuentra la fecha en la base de datos' })
            }
            res.send(month)
        } else if (role == 'seller') {

            const month = await SellerModel.find({ seller: res.locals.user.id, enable: true })
                .select('-roleType -token -__v');

            const GetMonth = month.filter(getMonth => {
                const Gmonth = moment(getMonth.Month).format('MMMM/YYYY')
                console.log('Month->', Gmonth, 'body.Month ->', body.month);
                return Gmonth == body.month
            })

            if (!month) {
                return res.status(400).json({ mensaje: 'No se encuentra la fecha en la base de datos' })
            }
            res.send(GetMonth)
        }

    } catch (err) {
        res.status(500).send(err);
    }
}

exports.GetYear = async (req, res) => {

    const role = res.locals.user.roleType
    const { body } = req

    try {
        if (role == 'admin') {

            const year = await SellerModel.find({ year: body.year }).select('-roleType -token -__v');

            if (!year) {
                return res.status(400).json({ mensaje: 'No se encuentra la fecha en la base de datos' })
            }
            res.send(year)
        } else if (role == 'seller') {

            const year = await SellerModel.find({ seller: res.locals.user.id })
                .select('-roleType -token -__v');

            const GetYear = year.filter(getYear => {
                const Gyear = moment(getYear.year).format('YYYY')
                console.log('year->', Gyear, 'body.year ->', body.year);
                return Gyear == body.year
            })

            if (!month) {
                return res.status(400).json({ mensaje: 'No se encuentra la fecha en la base de datos' })
            }
            res.send(GetYear)
        }

    } catch (err) {
        res.status(500).send(err);
    }
}

exports.getSellerAdmin = async (req, res) => {

    try {

        const seller = await AdminModel.find({ enable: true }).select('-token -password -__v -user -dni')

        res.send(seller)
    } catch (err) {
        res.status(500).send(err);
    }
}

exports.getSellerFalseAdmin = async (req, res) => {

    try {

        const seller = await AdminModel.find({ enable: false }).select('-token -password -__v -user -dni')

        res.send(seller)
    } catch (err) {
        res.status(500).send(err);
    }
}

exports.SearchOneSeller = async (req, res) => {

    try {
        const { body } = req

        const seller = await SellerModel.find({ fullname: body.fullname }).select('-roleType -token -__v');
        if (!seller) {
            return res.status(400).json({ mensaje: 'No se encuentra al Vendedor en la base de datos' })
        }
        res.send(seller)
    } catch (err) {
        res.status(500).send(err);
    }
}

exports.PutSales = async (req, res) => {

    try {

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ mensaje: 'No hay resultado para la Busqueda' });
        }

        const sales = await SellerModel.findByIdAndUpdate(req.params.id, req.body, { new: true })

        res.send(sales)
    } catch (err) {
        res.status(500).send(err);
    }
}

exports.SalesDis = async (req, res) => {

    try {
        const sales = await SellerModel.findByIdAndUpdate(req.params.id, { enable: false }, { new: true })

        res.send(sales)
    } catch (err) {
        res.status(500).send(err);
    }
}

exports.SalesEn = async (req, res) => {

    try {
        const sales = await SellerModel.findByIdAndUpdate(req.params.id, { enable: true }, { new: true }).select('-token -password -__v -user')

        res.send(sales)
    } catch (err) {
        res.status(500).send(err);
    }
}

exports.PutSeller = async (req, res) => {

    try {

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ mensaje: 'No hay resultado para la Busqueda' });
        }

        const seller = await AdminModel.findByIdAndUpdate(req.params.id, req.body, { new: true })
            .select('-token -password -__v -roleType -enable')
        res.send(seller)
    } catch (err) {
        res.status(500).send(err);
    }
}

exports.SellerDis = async (req, res) => {

    try {
        const seller = await AdminModel.findByIdAndUpdate(req.params.id, { enable: false }, { new: true })
            .select('-token -password -__v')
        res.send(seller)
    } catch (err) {
        res.status(500).send(err);
    }
}

exports.SellerEn = async (req, res) => {

    try {
        const seller = await AdminModel.findByIdAndUpdate(req.params.id, { enable: true }, { new: true })
            .select('-token -password -__v')
        res.send(seller)
    } catch (err) {
        res.status(500).send(err);
    }
}

exports.Logout = async (req, res) => {
    try {
        const role = res.locals.user.roleType

        if (role == 'admin') {
            await AdminModel.updateOne({ _id: res.locals.user.id }, { $set: { token: [] } })
        } else if (role == 'seller') {
            await SellerModel.updateOne({ _id: res.locals.user.id }, { $set: { token: [] } })
        }

        res.json({ mensaje: 'Deslogueo ok' })
    } catch (error) {
        console.log('error Logout Amin ->', error)
        res.status(500).send({ mensaje: 'Error', error })
    }
} 
