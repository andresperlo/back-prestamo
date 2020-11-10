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
<<<<<<< HEAD
        required:true,
        unique: true,
        lowercase: true
=======
        required: true,
        unique: true,
        lowercase:true
>>>>>>> 838a9eaa9a40324e5758a242266c0505c91f8fbb
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
<<<<<<< HEAD
    enable:{
        type: String,
        required:true,
        default: "SI"
=======
    enable: {
        type: String,
        required: true,
        default: 'SI'
>>>>>>> 838a9eaa9a40324e5758a242266c0505c91f8fbb
    },
    token: [String]
})

const AdminModel = mongoose.model('Administradores', AdminSchema)

module.exports = AdminModel;
