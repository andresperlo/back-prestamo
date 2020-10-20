const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs')
const moment = require('moment')
const SellerModel = require('../models/SellerModel');
const AdminModel = require('../models/AdminModel');
const AdminCreateModel = require('../models/CreateAdminModel');

exports.CreateAdmin = async (req, res) => {
    
    const {fullname, dni, address, celphone, email, username, password} = req.body

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
    
    const {fullname, dni, address, celphone, email, user, password} = req.body

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

exports.getSalesAdmin = async (req, res) => {

    try {

        let allSales = await SellerModel.find({enable: true}).select('-_id -__v')
        
        allSales = allSales.map(sales => {
            sales.date = moment((parseInt(sales.date))).format('DD-MM-YYYY')
            return sales
        })


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
        let sales = await SellerModel.findByIdAndUpdate(req.params.id, {enable:false}, { new: true })
       
        sales.date = moment((parseInt(sales.date))).format('DD-MM-YYYY')
       
        res.send(sales)
    } catch (err) {
        res.status(500).send(err);
    }
}

exports.SalesEn = async (req, res) => {

    try {        
        let sales = await SellerModel.findByIdAndUpdate(req.params.id, {enable:true}, { new: true }).select('-_id -token -password -__v -user')
       
        sales.date = moment((parseInt(sales.date))).format('DD-MM-YYYY')
       
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

        let allSalesFalse = await SellerModel.find({enable: false}).select('-_id -__v')

        allSalesFalse = allSalesFalse.map(sales => {
            sales.date = moment((parseInt(sales.date))).format('DD-MM-YYYY')
            return sales
        })
        res.send(allSalesFalse)
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

        let sale = await SellerModel.findById(req.params.id)
        .populate('seller', '-_id fullname')
        .select('-_id -roleType -token -__v -month -year');


        sale.date = moment((parseInt(sale.date))).format('DD-MM-YYYY')


        if (!sale) {
            return res.status(400).json({ mensaje: 'No se encuentra al Vendedor en la base de datos' })
        }
        res.send(sale)
    } catch (err) {
        res.status(500).send(err);
    }
}

exports.GetUserDni = async (req, res) => {
    try {
        const { body } = req

        let user = await SellerModel.findOne({ dniClient: body.dniClient }).select('-_id -roleType -token -__v');
       
        user.date = moment((parseInt(user.date))).format('DD-MM-YYYY')

        if (!user) {
            return res.status(400).json({ mensaje: 'No se encuentra el DNI en la base de datos' })
        }
        res.send(user)
    } catch (err) {
        res.status(500).send(err);
    }
}

exports.PutSales = async (req, res) => {

    try {

        if(!mongoose.Types.ObjectId.isValid(req.params.id)){
            return res.status(400).json({mensaje: 'No hay resultado para la Busqueda'});
        }
        
        let sales = await SellerModel.findByIdAndUpdate(req.params.id, req.body, { new: true })
       
        sales.date = moment((parseInt(sales.date))).format('DD-MM-YYYY')
       
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


exports.LogoutAdmin = async (req, res) => {
    try {

       await AdminCreateModel.updateOne({ _id: res.locals.user.id }, { $set: { token: [] } })
       res.json({ mensaje: 'Deslogueo ok' })
   } catch (error) {
       res.status(500).send({ mensaje: 'Error', error })
   }
} 
