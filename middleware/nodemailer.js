require('dotenv').config()
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
    process.env.CLIENTE_ID_G,
    process.env.CLIENTE_SECRET_G, // Client Secret
    process.env.REDIRECT_URL_G // Redirect URL
);

oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN_G
});

const accessToken = oauth2Client.getAccessToken()

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: "smtp.gmail.com",
    port: 465,
    secure: false, // upgrade later with STARTTLS
    auth: {
        type: "OAuth2",
        user: process.env.EMAIL,
        clientId: process.env.CLIENTE_ID_G,
        clientSecret: process.env.CLIENTE_SECRET_G,
        refreshToken: process.env.REFRESH_TOKEN_G,
        accessToken: accessToken
    }
});


const sendNodeMail = (subject, msg, file, email) => {
    console.log('file NodeMailer', file)
    //La función recibe por parámetros los datos a llenar en el correo
    const mailOptions = {
        from: email, // email sender
         to: `Asturias F & D <proyectofinalrestorant@gmail.com>`,
        subject: subject + ' ' +  email,
        attachments: [{
            path: file.path,
            filename: file.originalname,
            contentType: 'application/pdf'
         }],
        html: `
            <div>
                <div style='display: flex; justify-content: center'>
                    <h1 style='text-align: center'>${msg}</h1>
                <div>
            </div>    
        ` // html body | contenido del mail
    };

    return transporter.sendMail(mailOptions);
};

module.exports = sendNodeMail;

