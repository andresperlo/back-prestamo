const { validationResult } = require('express-validator')
let moment = require('moment');
moment.locale('es')
const today = moment().format('YYYY/MM/DD');
const month = moment().format('MMMM/YYYY');
const exactMonth = moment().format('MMMM');
const year = moment().format('YYYY');
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs')
const jsonwebtoken = require('jsonwebtoken')
const SellerModel = require('../models/SellerModel');
const AdminModel = require('../models/AdminModel');
const AdminCreateModel = require('../models/CreateAdminModel');
const VentasMensualModel = require('../models/VentasMensualModel');
const sendNodeMail = require('../middleware/nodemailer');
const cloudinary = require('cloudinary').v2
cloudinary.config({
    cloud_name: 'proyecto-final',
    api_key: '236639489389971',
    api_secret: 'EdjHVoS94Z5oZo56FQlPXEmXdvQ'
})

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

    try {
        const token = jsonwebtoken.sign(jwt_payload, process.env.JWT_SECRET, { expiresIn: process.env.TIME_EXP })
        if (AdminLogin) {
            AdminLogin.token = [token]
            await AdminCreateModel.update({ user: AdminLogin.user }, AdminLogin)
            res.send({ mensaje: 'Logueado Correctamente', token, role: AdminLogin.roleType, id: AdminLogin._id, fullname: AdminLogin.fullname })
        } else {
            SellerLogin.token = [token]
            await AdminModel.update({ user: SellerLogin.user }, SellerLogin)
            res.send({ mensaje: 'Logueado Correctamente', token, role: SellerLogin.roleType, id: SellerLogin._id, fullname: SellerLogin.fullname })
        }

    } catch (error) {
        console.log('error')
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
       /*  await usuario.save(); */
        res.send({ mensaje: 'Tu Administrador se Registro Correctamente'})
    } catch (error) {
        console.log(error);
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
        res.send({ mensaje: 'Tu Usuario se Registro Correctamente'})
    } catch (error) {
        res.status(500).send(error);
    }
}

exports.CreateSales = async (req, res) => {

    const { creditLine, typeOperation, newClient, typeClient, nameClient, dniClient, celphoneClient, quotaAmount, quantityQuotas, saleDetail } = req.body

    let amountApproved = parseInt(req.body.amountApproved);
    const sellerName = req.body.fullname ? req.body.fullname : res.locals.user.fullname
    const AdminName = res.locals.user.fullname
    const fullname = sellerName ? sellerName : AdminName
    let sellerExists = await AdminModel.findOne({ fullname });
    let AdminExists = await AdminCreateModel.findOne({ fullname });
    let idGral = []

    if (sellerExists) {
        let idSeller = sellerExists._id
        idGral.push(idSeller)
    } else if (AdminExists) {
        let idAdmin = AdminExists._id
        idGral.push(idAdmin)
    }

    const email = res.locals.user.email
    const userExists = await SellerModel.findOne({ dniClient });

    if (!userExists) {

        CreateSalesUser = {
            fullname,
            email,
            creditLine,
            typeOperation,
            newClient,
            typeClient,
            nameClient,
            dniClient,
            celphoneClient,
            amountApproved,
            quotaAmount,
            quantityQuotas,
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
        if (userExists.quantityQuotas > 3) {
            return res.status(400).json({ mensaje: 'No puede tener el prestamo. Cuota mayor a 3' })
        } else {

            CreateSalesUser = {
                fullname,
                email,
                creditLine,
                typeOperation,
                newClient,
                typeClient,
                nameClient,
                dniClient,
                celphoneClient,
                amountApproved,
                quotaAmount,
                quantityQuotas,
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
    
    let ventaTotal = await VentasMensualModel.findOne({ seller: idGral, year: year })

    try {
        const usuario = new SellerModel(CreateSalesUser)
        await usuario.save();
        if (!ventaTotal) {

            ventaTotal = new VentasMensualModel({ seller: idGral, year: year })

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
        console.log(error)
        res.status(500).send(error);
    }
}

exports.SendGmailer = async (req, res) => {
    console.log('llega CreateSalesUser ->', CreateSalesUser)
    const fs = require('fs');
    const readline = require('readline');
    const { google } = require('googleapis');
    const MailComposer = require('nodemailer/lib/mail-composer');

    // If modifying these scopes, delete token.json.
    const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.modify',
        'https://www.googleapis.com/auth/gmail.compose', 'https://www.googleapis.com/auth/gmail.send'];
    // The file token.json stores the user's access and refresh tokens, and is
    // created automatically when the authorization flow completes for the first
    // time.
    const TOKEN_PATH = 'token.json';

    // Load client secrets from a local file.
    fs.readFile('credentials.json', (err, content) => {
        if (err) {
            return console.log('Error loading client secret file:', err);
        }

        // Authorize the client with credentials, then call the Gmail API.
        authorize(JSON.parse(content), sendEmail);
    });

    /**
     * Create an OAuth2 client with the given credentials, and then execute the
     * given callback function.
     * @param {Object} credentials The authorization client credentials.
     * @param {function} callback The callback to call with the authorized client.
     */
    function authorize(credentials, callback) {
        const { client_secret, client_id, redirect_uris } = credentials.installed;
        const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

        // Check if we have previously stored a token.
        fs.readFile(TOKEN_PATH, (err, token) => {
            if (err) {
                return getNewToken(oAuth2Client, callback);
            }
            oAuth2Client.setCredentials(JSON.parse(token));
            callback(oAuth2Client);
        });
    }

    /**
     * Get and store new token after prompting for user authorization, and then
     * execute the given callback with the authorized OAuth2 client.
     * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
     * @param {getEventsCallback} callback The callback for the authorized client.
     */

    function getNewToken(oAuth2Client, callback) {
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
        });
        console.log('Authorize this app by visiting this url:', authUrl);
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        rl.question('Enter the code from that page here: ', (code) => {
            rl.close();
            oAuth2Client.getToken(code, (err, token) => {
                if (err) return console.error('Error retrieving access token', err);
                oAuth2Client.setCredentials(token);
                // Store the token to disk for later program executions
                fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                    if (err) return console.error(err);
                    console.log('Token stored to', TOKEN_PATH);
                });
                callback(oAuth2Client);
            });
        });
    }
    /*  */

    const file = Object.values(req.files)
    const {fullname, email, creditLine, typeOperation, newClient, typeClient,
         nameClient, dniClient, celphoneClient, amountApproved, quotaAmount,
          quantityQuotas, saleDetail, date} = CreateSalesUser

    for (let index = 0; index < file.length; index++) {
        const element = file[index];
        let originalFileName = element.originalFilename
        let pathFile = element.path

        console.log('element', element)
        console.log('original file name->', originalFileName)
        console.log('path ->', pathFile)

        function sendEmail(auth) {

            // ----------nodemailer test----------------------------------------------------

            let mail = new MailComposer(
                {
                    to: process.env.EMAIL,
                    text: "I hope this works",
                    html: `<h3 style='margin: 0;'>Nombre del Vendedor: ${fullname}</h3></br>
                           <h3 style='margin: 0;'>Email del Vendedor: ${email} </h3> </br>
                           <h3 style='margin: 0;'>Linea de Credito: ${creditLine} </h3> </br>
                           <h3 style='margin: 0;'>Tipo de Operacion: ${typeOperation} </h3> </br>
                           <h3 style='margin: 0;'>Nuevo Cliente: ${newClient} </h3> </br>
                           <h3 style='margin: 0;'>Tipo de Cliente: ${typeClient} </h3> </br>
                           <h3 style='margin: 0;'>Nombre : ${nameClient} </h3> </br>
                           <h3 style='margin: 0;'>DNI : ${dniClient} </h3> </br>
                           <h3 style='margin: 0;'>Celular: ${celphoneClient} </h3> </br>
                           <h3 style='margin: 0;'>Monto Aprobado: ${amountApproved} </h3> </br>
                           <h3 style='margin: 0;'>Cantidad de Coutas: ${quantityQuotas} </h3> </br>
                           <h3 style='margin: 0;'>Monto Por Cuota: ${quotaAmount} </h3> </br>
                           <h3 style='margin: 0;'>Detalle de la Venta: ${saleDetail} </h3> </br>
                           <h3 style='margin: 0;'>Fecha: ${date} </h3> </br> 
                    `,
                    subject: `${nameClient} | ${fullname}`,
                    textEncoding: "base64",
                    attachments: [
                        {   // encoded string as an attachment
                            filename: originalFileName,
                            path: pathFile,
                            content: 'aGVsbG8gd29ybGQh',
                            encoding: 'base64'
                        },
                    ]
                });

                let mailSeller = new MailComposer(
                    {
                        to: `${email}`,
                        text: "I hope this works",
                        html: `<h3 style='margin: 0;'>Confirmacion de Venta Cargada</h3></br>
                              
                               <h3 style='margin: 0;'>Fecha: ${date} </h3> </br> 
                        `,
                        subject: `Confirmacion de Venta`,
                        textEncoding: "base64",
                    });



                console.log('mail ->', mail)

            mail.compile().build((error, msg) => {
                if (error) return console.log('Error compiling email ' + error);

                const encodedMessage = Buffer.from(msg)
                    .toString('base64')
                    .replace(/\+/g, '-')
                    .replace(/\//g, '_')
                    .replace(/=+$/, '');

                const gmail = google.gmail({ version: 'v1', auth });
                gmail.users.messages.send({
                    userId: 'me',
                    resource: {
                        raw: encodedMessage,
                    }
                }, (err, result) => {
                    if (err) return console.log('NODEMAILER - The API returned an error: ' + err);

                    console.log("NODEMAILER - Sending email reply from server:", result.data);
                });

            })

            mailSeller.compile().build((error, msg) => {
                if (error) return console.log('Error compiling email ' + error);

                const encodedMessage = Buffer.from(msg)
                    .toString('base64')
                    .replace(/\+/g, '-')
                    .replace(/\//g, '_')
                    .replace(/=+$/, '');

                const gmail = google.gmail({ version: 'v1', auth });
                gmail.users.messages.send({
                    userId: 'me',
                    resource: {
                        raw: encodedMessage,
                    }
                }, (err, result) => {
                    if (err) return console.log('NODEMAILER - The API returned an error: ' + err);

                    console.log("NODEMAILER - Sending email reply from server:", result.data);
                });

            })


        }

    }

  /*   res.send({message: 'ya esta compagre'}) */

}

exports.MontoSales = async (req, res) => {

    const role = res.locals.user.roleType

    try {
        if (role == 'admin') {

            const allSales = await VentasMensualModel.find({})
                .populate('seller', 'fullname ')
            const vendedor = await AdminModel.find({ seller: allSales.seller })
            res.send(allSales)

        } else if (role == 'seller') {

            const allSales = await VentasMensualModel.findOne({ seller: res.locals.user.id, year: year })
                .populate('seller', 'fullname ')
                .select(' -fullname')

            res.send(allSales)
        }
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
}

exports.getSalesAdmin = async (req, res) => {

    const { limit, page, date = "", nameClient = "", dniClient = "", celphoneClient = "", fullname = "", creditLine = "", quotaAmount = "", quantityQuotas = "", enable = "", saleDetail = "", amountApproved = "" } = req.query

    const role = res.locals.user.roleType

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
                quantityQuotas: {
                    $regex: quantityQuotas
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
        console.log(err)
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
    const { limit, page, dni = "", celphone = "", fullname = "", enable = "", address = "", email = "" } = req.query

    console.log(req.query);
    try {

        const seller = await AdminModel.paginate({
            enable: {
                $regex: enable
            },
            email: {
                $regex: email
            },
            dni: {
                $regex: dni
            },
            celphone: {
                $regex: celphone
            },
            fullname: {
                $regex: fullname
            },
            address: {
                $regex: address
            }
        }, { limit, page })

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
        console.log(error)
        res.status(500).send({ mensaje: 'Error', error })
    }
}
