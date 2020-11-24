const mongoose = require('mongoose')

const VentasSchema = new mongoose.Schema({

  
    enero: {
        type: Number,
        required: true,
        trim: true,
        default: 0
    },
    ventasEnero:{
        type: Number,
        required: true,
        trim: true,
        default: 0
    },
    febrero: {
        type: Number,
        required: true,
        trim: true,
        default: 0
    },
    ventasFebrero:{
        type: Number,
        required: true,
        trim: true,
        default: 0
    },
    marzo: {
        type: Number,
        required: true,
        trim: true,
        default: 0
    },
    ventasMarzo:{
        type: Number,
        required: true,
        trim: true,
        default: 0
    },
    abril: {
        type: Number,
        required: true,
        trim: true,
        default: 0
    },
    ventasAbril:{
        type: Number,
        required: true,
        trim: true,
        default: 0
    },
    mayo: {
        type: Number,
        required: true,
        trim: true,
        default: 0
    },
    ventasMayo:{
        type: Number,
        required: true,
        trim: true,
        default: 0
    },
    junio: {
        type: Number,
        required: true,
        trim: true,
        default: 0
    },
    ventasJunio:{
        type: Number,
        required: true,
        trim: true,
        default: 0
    },
    julio: {
        type: Number,
        required: true,
        trim: true,
        default: 0
    },
    ventasJulio:{
        type: Number,
        required: true,
        trim: true,
        default: 0
    },
    agosto: {
        type: Number,
        required: true,
        trim: true,
        default: 0
    },
    ventasAgosto:{
        type: Number,
        required: true,
        trim: true,
        default: 0
    },
    septiembre: {
        type: Number,
        required: true,
        trim: true,
        default: 0
    },
    ventasSeptiembre:{
        type: Number,
        required: true,
        trim: true,
        default: 0
    },
    octubre: {
        type: Number,
        required: true,
        trim: true,
        default: 0
    },
    ventasOctubre:{
        type: Number,
        required: true,
        trim: true,
        default: 0
    },
    noviembre: {
        type: Number,
        required: true,
        trim: true,
        default: 0
    },
    ventasNoviembre:{
        type: Number,
        required: true,
        trim: true,
        default: 0
    },
    diciembre: {
        type: Number,
        required: true,
        trim: true,
        default: 0
    },
    ventasDiciembre:{
        type: Number,
        required: true,
        trim: true,
        default: 0
    },
    year: {
        type: String
    },
    annualAmountApproved: {
        type: Number,
        required: true,
        trim: true,
        default: 0
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'seller'
    },
})

const VentasMensualModel = mongoose.model('montotal', VentasSchema)

module.exports = VentasMensualModel;
