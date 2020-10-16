const mongoose = require('mongoose')

const FormSchema = new mongoose.Schema({
    
    nombreVendedor:{
        type: String,
        trim: true,
        required:true  
    },
    lineaCredito:{
        type: String,
        trim: true,
        required:true  
    },
    tipOperacion: {
        type: String,
        trim: true,
        required:true  
    },
    clienteNuevo:{
        type: Boolean,
        trim: true,
        required:true  
    },
    nombreCliente:{
        type: String,
        trim: true,
        required:true  
    },
    dniCliente:{
        type: Number,
        trim: true,
        unique: true,
        required:true  
    },
    celularCliente: {
        type: Number,
        required: true,
        trim: true,
    },
    montoAprobado:{
        type: Number,
        required: true,
        trim: true
    },
    cantidadCuota:{
        type: Number,
        required: true,
        trim: true
    },
    montoCuota:{
        type: Number,
        required: true,
        trim: true
    },
    detalleVenta:{
        type: String,
        required: true,
        trim: true
    },
    seller: { 
        type: mongoose.Schema.Types.ObjectId,
        ref:'vendedor'
    },
    date: {
        type: String
    },
    month:{
        type: String
    },
    year: {
        type: String
    }
})
 
const FormModel = mongoose.model('formulario', FormSchema)

module.exports = FormModel;