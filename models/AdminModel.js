const mongoose = require('mongoose')

const AdminSchema = new mongoose.Schema({
    
    nombreVendedor:{
        type: String,
        trim: true,
        required:true  
    },
    apellidoVendedor:{
        type: String,
        trim: true,
        required:true  
    },
    dniVendedor:{
        type: Number,
        trim: true,
        unique: true,
        required:true  
    },
    direccionVendedor:{
        type: String,
        trim: true,
        required:true  
    },
    celularVendedor: {
        type: Number,
        required: true,
        trim: true,
    },
    emailVendedor:{
        type: String,
        trim: true,
        required:true,
        unique: true
    },
    usuarioVendedor:{
        type: String,
        trim: true,
        required:true,
        unique: true
    },
    password:{
        type: String,
        required: true,
        trim: true
    },
    roleType:{
        type: String,
        default: 'vendedor',
        required:true  
    },
    token: [String]
})
 
const AdminModel = mongoose.model('vendedor', AdminSchema)

module.exports = AdminModel;