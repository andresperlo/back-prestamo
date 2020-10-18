const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs')
const moment = require('moment')
const SellerModel = require('../models/SellerModel');
const AdminModel = require('../models/AdminModel');

exports.CreateSeller = async (req, res) => {
    
    const {fullname, dni, address, celphone, email, user, password} = req.body

    let userExists = await AdminModel.findOne({ dni });
    if (userExists) {
        return res.status(400).json({ mensaje: 'El Usuario ya existe' })
    }

    let mailExists = await AdminModel.findOne({ email });
    if (mailExists) {
        console.log(mailExists)
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


exports.getSalesAdmin = async (req, res) => {

    try {

        const allSales = await SellerModel.find({enable: true}).select('-_id -__v')
        
        res.send(allSales)
    } catch (err) {
        res.status(500).send(err);
    }
}

exports.getSellerAdmin = async (req, res) => {

    try {

        const seller = await AdminModel.find({enable: true}).select('-_id -token -password -__v -user -dni')
        
        res.send(seller)
    } catch (err) {
        res.status(500).send(err);
    }
}

exports.SalesDis = async (req, res) => {

    try {        
        const sales = await SellerModel.findByIdAndUpdate(req.params.id, {enable:false}, { new: true })
        res.send(sales)
    } catch (err) {
        res.status(500).send(err);
    }
}

exports.SalesEn = async (req, res) => {

    try {        
        const sales = await SellerModel.findByIdAndUpdate(req.params.id, {enable:true}, { new: true }).select('-_id -token -password -__v -user')
        res.send(sales)
    } catch (err) {
        res.status(500).send(err);
    }
}

exports.SellerDis = async (req, res) => {

    try {        
        const seller = await AdminModel.findByIdAndUpdate(req.params.id, {enable:false}, { new: true })
        .select('-token -password -__v')
        res.send(seller)
    } catch (err) {
        res.status(500).send(err);
    }
}

exports.SellerEn = async (req, res) => {

    try {        
        const seller = await AdminModel.findByIdAndUpdate(req.params.id, {enable:true}, { new: true })
        .select('-token -password -__v')
        res.send(seller)
    } catch (err) {
        res.status(500).send(err);
    }
}

exports.getSalesFalseAdmin = async (req, res) => {

    try {

        const sales = await SellerModel.find({enable: false}).select('-_id -__v')
        
        res.send(sales)
    } catch (err) {
        res.status(500).send(err);
    }
}

exports.getSellerFalseAdmin = async (req, res) => {

    try {

        const seller = await AdminModel.find({enable: false}).select('-_id -token -password -__v -user -dni')
        
        res.send(seller)
    } catch (err) {
        res.status(500).send(err);
    }
}

exports.GetOneDate = async (req, res) => {
    try {
        const { body } = req
        
        const getSales = await SellerModel.find({});
        console.log('getSales', getSales);
        const GetDate = getSales.filter(getDate => {
            console.log('getDAte ->', getDate);
            const date = moment(parseInt(getDate.date)).format('YYYY-MM-DD')
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

        const month = await SellerModel.find({ month: body.month }).select('-_id -roleType -token -__v');

        if (!month) {
            return res.status(400).json({ mensaje: 'No se encuentra la fecha en la base de datos' })
        }
        res.send(month)
    } catch (err) {
        res.status(500).send(err);
    }
}

exports.GetYear = async (req, res) => {
    try {
        const { body } = req

        const year = await SellerModel.find({ year: body.year }).select('-_id -roleType -token -__v');

        if (!year) {
            return res.status(400).json({ mensaje: 'No se encuentra la fecha en la base de datos' })
        }
        res.send(year)
    } catch (err) {
        res.status(500).send(err);
    }
}

exports.SearchOneSeller = async (req, res) => {
    try {
        const { body } = req

        const seller = await SellerModel.find({ fullname: body.fullname }).select('-_id -roleType -token -__v');
        if (!seller) {
            return res.status(400).json({ mensaje: 'No se encuentra al Vendedor en la base de datos' })
        }
        res.send(seller)
    } catch (err) {
        res.status(500).send(err);
    }
}

exports.SearchOneSale = async (req, res) => {
    try {

        const sale = await SellerModel.findById(req.params.id)
        .populate('seller', '-_id fullname')
        .select('-_id -roleType -token -__v -month -year');
        if (!sale) {
            return res.status(400).json({ mensaje: 'No se encuentra al Vendedor en la base de datos' })
        }
        res.send(sale)
    } catch (err) {
        res.status(500).send(err);
    }
}

exports.PutSales = async (req, res) => {

    try {

        if(!mongoose.Types.ObjectId.isValid(req.params.id)){
            return res.status(400).json({mensaje: 'No hay resultado para la Busqueda'});
        }
        
        const sales = await SellerModel.findByIdAndUpdate(req.params.id, req.body, { new: true })
        res.send(sales)
    } catch (err) {
        res.status(500).send(err);
    }
}

exports.PutSeller = async (req, res) => {

    try {

        if(!mongoose.Types.ObjectId.isValid(req.params.id)){
            return res.status(400).json({mensaje: 'No hay resultado para la Busqueda'});
        }
        
        const seller = await AdminModel.findByIdAndUpdate(req.params.id, req.body, { new: true })
        .select('-token -password -__v -_id -roleType -enable')
        res.send(seller)
    } catch (err) {
        res.status(500).send(err);
    }
}
