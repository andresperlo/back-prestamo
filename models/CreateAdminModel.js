const mongoose = require('mongoose')

const AdminSchema = new mongoose.Schema({

    fullname: {
        type: String,
        trim: true,
        required: true,
        uppercase: true
    },
    dni: {
        type: String,
        trim: true,
        unique: true,
        required: true
    },
    address: {
        type: String,
        trim: true,
        required: true,
        uppercase: true
    },
    celphone: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true,
        uppercase: true
    },
    user: {
        type: String,
        trim: true,
        required:true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    roleType: {
        type: String,
        default: 'admin',
        required: true
    },
    enable: {
        type: String,
        required: true,
        default: "SI"
    },
    token: [String]
})

const AdminModel = mongoose.model('Administradores', AdminSchema)

module.exports = AdminModel;
