const mongoose = require('mongoose')
const Paginate = require('mongoose-paginate-v2')

const SellerSchema = new mongoose.Schema({

    fullname: {
        type: String,
        trim: true,
        required: true
    },
    creditLine: {
        type: String,
        trim: true,
        required: true
    },
    typeOperation: {
        type: String,
        trim: true,
        required: true
    },
    newClient: {
        type: String,
        trim: true,
        required: true
    },
    typeClient:{
        type: String,
        trim: true
    },
    nameClient: {
        type: String,
        trim: true,
        required: true
    },
    dniClient: {
        type: String,
        trim: true,
        unique: true,
        required: true
    },
    celphoneClient: {
        type: String,
        required: true,
        trim: true,
    },
    amountApproved: {
        type: String,
        required: true,
        trim: true
    },
    quotaAmount: {
        type: String,
        required: true,
        trim: true
    },
    quantityQuotas: {
        type: String,
        required: true,
        trim: true
    },
    saleDetail: {
        type: String,
        trim: true
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'seller'
    },
    date: {
        type: String
    },
    exactMonth: {
        type: String
    },
    year: {
        type: String
    },
    enable: {
        type: String,
        required: true,
        default: "SI"
    },
})


SellerSchema.plugin(Paginate)

const SellerModel = mongoose.model('sales', SellerSchema)

module.exports = SellerModel;
