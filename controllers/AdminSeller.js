const path = require('path')
const { validationResult } = require('express-validator')
const multer = require('multer')
let moment = require('moment'); // require
moment.locale('es')
const today = moment().format('DD/MM/YYYY');
const month = moment().format('MMMM/YYYY');
const exactMonth = moment().format('MMMM');
const year =  moment().format('YYYY');
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs')
const jsonwebtoken = require('jsonwebtoken')
const SellerModel = require('../models/SellerModel');
const AdminModel = require('../models/AdminModel');
const AdminCreateModel = require('../models/CreateAdminModel');
const VentasMensualModel = require('../models/VentasMensualModel');
const sendNodeMail = require('../middleware/nodemailer');
const { parseTwoDigitYear } = require('moment');
const cloudinary = require('cloudinary').v2

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

exports.login = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() })
    }

    const { body } = req

    const AdminLogin = await AdminCreateModel.findOne({ user: body.user })
    console.log('Admin ->', AdminLogin)
    const SellerLogin = await AdminModel.findOne({ user: body.user });
    console.log('Seller ->', SellerLogin)

    if (!AdminLogin && !SellerLogin) {
        return res.status(400).json({ mensaje: 'USUARIO y/o Contraseña Incorrectos' });
    }


    if (AdminLogin) {
        if (AdminLogin.enable !== "SI") {
            return res.status(400).json({ mensaje: 'USUARIO y/o Contraseña Incorrectos Seller o Admin' });
        }
    }

    if (SellerLogin) {
        if (SellerLogin.enable !== "SI") {
            return res.status(400).json({ mensaje: 'USUARIO y/o Contraseña Incorrectos Seller o Admin' });
        }
    }



    const passCheck = SellerLogin ? await bcryptjs.compare(body.password, SellerLogin.password)
        :
        await bcryptjs.compare(body.password, AdminLogin.password)
    console.log('password', passCheck)
    if (!passCheck) {
        return res.status(400).json({ mensaje: 'Usuario y/o CONTRASEÑA Incorrectos' })
    }

    const jwt_payload = {
        user: {
            id: AdminLogin ? AdminLogin.id : SellerLogin.id,
            user: AdminLogin ? AdminLogin.user : SellerLogin.user,
            role: AdminLogin ? AdminLogin.roleType : SellerLogin.roleType,
            fullname: AdminLogin ? AdminLogin.fullname : SellerLogin.fullname
        }
    }

    console.log('jwt ->', jwt_payload)

    try {
        const token = jsonwebtoken.sign(jwt_payload, process.env.JWT_SECRET, { expiresIn: process.env.TIME_EXP })
        if (AdminLogin) {
            AdminLogin.token = [token]
            await AdminCreateModel.update({ user: AdminLogin.user }, AdminLogin)
            res.send({ mensaje: 'Logueado Correctamente', token, role: AdminLogin.roleType, id: AdminLogin._id, fullname: AdminLogin.fullname })
        } else {
            SellerLogin.token = [token]
            console.log('seller ->', SellerLogin)
            await AdminModel.update({ user: SellerLogin.user }, SellerLogin)
            res.send({ mensaje: 'Logueado Correctamente', token, role: SellerLogin.roleType, id: SellerLogin._id, fullname: SellerLogin.fullname })
        }
        console.log('token ->', token)

    } catch (error) {
        return res.status(500).json({ mensaje: 'ERROR', error })
    }
}

exports.CreateAdmin = async (req, res) => {

    const { fullname, dni, address, celphone, email, user, password } = req.body

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
        user,
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
        res.send({ mensaje: 'Tu Usuario se Registro Correctamente', users, id: users._id })
    } catch (error) {
        res.status(500).send(error);
    }
}

exports.CreateSales = async (req, res) => {

    const { creditLine, typeOperation, newClient, nameClient, dniClient, celphoneClient, quotaAmount, feeAmount, saleDetail } = req.body

    let amountApproved = parseInt(req.body.amountApproved);

    const sellerName = req.body.fullname ? req.body.fullname : res.locals.user.fullname
    console.log('sellerName ', sellerName);

    const AdminName = res.locals.user.fullname
    console.log('AdminName ->', AdminName);

    const fullname = sellerName ? sellerName : AdminName
    console.log('nombre que llega por body: ', fullname);

    let sellerExists = await AdminModel.findOne({ fullname });
    let AdminExists = await AdminCreateModel.findOne({ fullname });
    let idGral = []
    console.log('sellerExist ->', sellerExists);
    console.log('AdminExist ->', AdminExists);

    if (sellerExists) {
        let idSeller = sellerExists._id
        idGral.push(idSeller)
    } else if (AdminExists) {
        let idAdmin = AdminExists._id
        console.log('idAdmin ->', idAdmin);
        idGral.push(idAdmin)
    }

    const email = res.locals.user.email
    const userExists = await SellerModel.findOne({ dniClient });
    console.log('dni cliente ->', userExists)
    if (!userExists) {

        CreateSalesUser = {
            fullname,
            email,
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
            seller: idGral,
            date: today,
            month: month,
            exactMonth: exactMonth,
            year: year,
            tokens: []
        };
    }

    if (userExists) {
        console.log('userExist ->', userExists)
        if (userExists.quotaAmount > 3) {
            return res.status(400).json({ mensaje: 'No puede tener el prestamo. Cuota mayor a 3' })
        } else {

            CreateSalesUser = {
                fullname,
                email,
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
                seller: idGral,
                date: today,
                month: month,
                exactMonth: exactMonth,
                year: year,
                tokens: []
            };

        }
    }
    console.log('antes del venta total');
    console.log('idSeller antes de venta', idGral);
    console.log('year antes de ventas', year);

    let ventaTotal = await VentasMensualModel.findOne({ seller: idGral, year: year })
    
    try {
        const usuario = new SellerModel(CreateSalesUser)
        await usuario.save();
        if (!ventaTotal) {

            console.log('año ->', year)
            ventaTotal = new VentasMensualModel({ seller: idGral, year: year })

            let vendedor = await AdminModel.findOne({fullname})
            let id = ventaTotal._id
            let saleFound = vendedor.sales.find( sale => sale === id )

            if(!saleFound){
                vendedor.sales.push(id)
               await vendedor.save()
            }
           
            console.log('vendedorNew ->', vendedor)
            if (CreateSalesUser.exactMonth == 'enero') {
                ventaTotal.enero += CreateSalesUser.amountApproved
                ventaTotal.annualAmountApproved += CreateSalesUser.amountApproved
                ventaTotal.save()
            } else if (CreateSalesUser.exactMonth == 'febrero') {
                ventaTotal.febrero += CreateSalesUser.amountApproved
                ventaTotal.annualAmountApproved += CreateSalesUser.amountApproved
                ventaTotal.save()
            } else if (CreateSalesUser.exactMonth == 'marzo') {
                ventaTotal.marzo += CreateSalesUser.amountApproved
                ventaTotal.annualAmountApproved += CreateSalesUser.amountApproved
                ventaTotal.save()
            } else if (CreateSalesUser.exactMonth == 'abril') {
                ventaTotal.abril += CreateSalesUser.amountApproved
                ventaTotal.annualAmountApproved += CreateSalesUser.amountApproved
                ventaTotal.save()
            } else if (CreateSalesUser.exactMonth == 'mayo') {
                ventaTotal.mayo += CreateSalesUser.amountApproved
                ventaTotal.annualAmountApproved += CreateSalesUser.amountApproved
                ventaTotal.save()
            } else if (CreateSalesUser.exactMonth == 'junio') {
                ventaTotal.junio += CreateSalesUser.amountApproved
                ventaTotal.annualAmountApproved += CreateSalesUser.amountApproved
                ventaTotal.save()
            } else if (CreateSalesUser.exactMonth == 'julio') {
                ventaTotal.julio += CreateSalesUser.amountApproved
                ventaTotal.annualAmountApproved += CreateSalesUser.amountApproved
                ventaTotal.save()
            } else if (CreateSalesUser.exactMonth == 'agosto') {
                ventaTotal.agosto += CreateSalesUser.amountApproved
                ventaTotal.annualAmountApproved += CreateSalesUser.amountApproved
                ventaTotal.save()
            } else if (CreateSalesUser.exactMonth == 'septiembre') {
                ventaTotal.septiembre += CreateSalesUser.amountApproved
                ventaTotal.annualAmountApproved += CreateSalesUser.amountApproved
                ventaTotal.save()
            } else if (CreateSalesUser.exactMonth == 'octubre') {
                ventaTotal.octubre += CreateSalesUser.amountApproved
                ventaTotal.annualAmountApproved += CreateSalesUser.amountApproved
                ventaTotal.save()
            } else if (CreateSalesUser.exactMonth == 'noviembre') {
                ventaTotal.noviembre += CreateSalesUser.amountApproved
                ventaTotal.annualAmountApproved += CreateSalesUser.amountApproved
                ventaTotal.save()
            } else if (CreateSalesUser.exactMonth == 'diciembre') {
                ventaTotal.diciembre += CreateSalesUser.amountApproved
                ventaTotal.annualAmountApproved += CreateSalesUser.amountApproved
                ventaTotal.save()
            }
        } else {

            if (CreateSalesUser.exactMonth == 'enero') {
                ventaTotal.enero += CreateSalesUser.amountApproved
                ventaTotal.annualAmountApproved += CreateSalesUser.amountApproved
                ventaTotal.save()
            } else if (CreateSalesUser.exactMonth == 'febrero') {
                ventaTotal.febrero += CreateSalesUser.amountApproved
                ventaTotal.annualAmountApproved += CreateSalesUser.amountApproved
                ventaTotal.save()
            } else if (CreateSalesUser.exactMonth == 'marzo') {
                ventaTotal.marzo += CreateSalesUser.amountApproved
                ventaTotal.annualAmountApproved += CreateSalesUser.amountApproved
                ventaTotal.save()
            } else if (CreateSalesUser.exactMonth == 'abril') {
                ventaTotal.abril += CreateSalesUser.amountApproved
                ventaTotal.annualAmountApproved += CreateSalesUser.amountApproved
                ventaTotal.save()
            } else if (CreateSalesUser.exactMonth == 'mayo') {
                ventaTotal.mayo += CreateSalesUser.amountApproved
                ventaTotal.annualAmountApproved += CreateSalesUser.amountApproved
                ventaTotal.save()
            } else if (CreateSalesUser.exactMonth == 'junio') {
                ventaTotal.junio += CreateSalesUser.amountApproved
                ventaTotal.annualAmountApproved += CreateSalesUser.amountApproved
                ventaTotal.save()
            } else if (CreateSalesUser.exactMonth == 'julio') {
                ventaTotal.julio += CreateSalesUser.amountApproved
                ventaTotal.annualAmountApproved += CreateSalesUser.amountApproved
                ventaTotal.save()
            } else if (CreateSalesUser.exactMonth == 'agosto') {
                ventaTotal.agosto += CreateSalesUser.amountApproved
                ventaTotal.annualAmountApproved += CreateSalesUser.amountApproved
                ventaTotal.save()
            } else if (CreateSalesUser.exactMonth == 'septiembre') {
                ventaTotal.septiembre += CreateSalesUser.amountApproved
                ventaTotal.annualAmountApproved += CreateSalesUser.amountApproved
                ventaTotal.save()
            } else if (CreateSalesUser.exactMonth == 'octubre') {
                ventaTotal.octubre += CreateSalesUser.amountApproved
                ventaTotal.annualAmountApproved += CreateSalesUser.amountApproved
                ventaTotal.save()
            } else if (CreateSalesUser.exactMonth == 'noviembre') {
                ventaTotal.noviembre += CreateSalesUser.amountApproved
                ventaTotal.annualAmountApproved += CreateSalesUser.amountApproved
                ventaTotal.save()
            } else if (CreateSalesUser.exactMonth == 'diciembre') {
                ventaTotal.diciembre += CreateSalesUser.amountApproved
                ventaTotal.annualAmountApproved += CreateSalesUser.amountApproved
                ventaTotal.save()
            }
        }

        res.send({ mensaje: 'Venta Cargada Correctamente', CreateSalesUser, id: usuario._id })
    } catch (error) {
        console.log('error de regsales ->', error)
        res.status(500).send(error);
    }
}

exports.pdf = async (req, res) => {

    console.log(req.params.id);
    const IdPdf = await SellerModel.findById(req.params.id)
    console.log('req.params.id ->', req.params.id)
    console.log('idPdf->', IdPdf)
    if (!IdPdf) {
        return res.status(400).json({ message: 'id not found.' });
    }

    try {

        const file = Object.values(req.files)
        console.log('file ->', file)
        const promises = file.map(pdf => {
            cloudinary.uploader.upload(pdf.path)
        })

        const SendPdf = {
            subject: 'Nueva Venta',
            msg: '¡Nueva Venta de ' + CreateSalesUser.fullname + '!',
            file: file,
            email: CreateSalesUser.email
        }
        console.log('sendPdf ->', SendPdf)

        await sendNodeMail(SendPdf.subject, SendPdf.msg, SendPdf.file, SendPdf.email)
        res.send('Envio de PDF')
    } catch (error) {
        console.log('error pdf ->', error)
        return res.status(500).json({ message: 'Error 500' });

    }

}

exports.MontoSales = async (req, res) => {

    const role = res.locals.user.roleType
    console.log('role', role)

    try {
        if (role == 'admin') {

            const allSales = await VentasMensualModel.find({})
                .populate('seller', 'fullname ')
            const vendedor = await AdminModel.find({ seller: allSales.seller })
            console.log('vendedor', vendedor)
            res.send(allSales)

        } else if (role == 'seller') {

            const allSales = await VentasMensualModel.findOne({ seller: res.locals.user.id, year: year })
                .populate('seller', 'fullname ')
                .select(' -fullname')

            console.log('allSales ->', allSales)
            res.send(allSales)
        }
    } catch (err) {
        res.status(500).send(err);
    }
}

exports.getSalesAdmin = async (req, res) => {

    const { limit, page, date = "", nameClient = "", dniClient = "", celphoneClient = "", fullname = "", creditLine = "", quotaAmount = "", feeAmount = "", enable = "", saleDetail = "", amountApproved = "" } = req.query

    const role = res.locals.user.roleType
    console.log('role', role)
    console.log('limit ->', limit + ' ' + 'page ->', page)
    console.log('Params ->', req.query)

    try {
        if (role == 'admin') {

            const allSales = await SellerModel.paginate({
                nameClient: {
                    $regex: nameClient
                },
                date: {
                    $regex: date
                },
                dniClient: {
                    $regex: dniClient
                },
                celphoneClient: {
                    $regex: celphoneClient
                },
                fullname: {
                    $regex: fullname,
                },
                creditLine: {
                    $regex: creditLine
                },
                quotaAmount: {
                    $regex: quotaAmount
                },
                feeAmount: {
                    $regex: feeAmount
                },
                saleDetail: {
                    $regex: saleDetail
                },
                enable: {
                    $regex: enable
                },
                amountApproved: {
                    $regex: amountApproved,
                }
            }, { limit, page, sort: { date: -1 } })

            res.send(allSales)
        } else if (role == 'seller') {

            const allSales = await SellerModel.find({ seller: res.locals.user.id, enable: 'SI' })
                .populate('seller', 'fullname ')

            res.send(allSales)
        }
    } catch (err) {
        console.log('error paginate ->', err)
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

exports.getSellerAdmin = async (req, res) => {

    try {

        const seller = await AdminModel.find({}).populate('sales')

        res.send(seller)
    } catch (err) {
        console.log(err);
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
