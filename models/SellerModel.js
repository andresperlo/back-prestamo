const mongoose = require('mongoose')
const Paginate = require('mongoose-paginate-v2')
const { paginate } = require('./AdminModel')

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
    feeAmount: {
        type: String,
        required: true,
        trim: true
    },
    saleDetail: {
        type: String,
        // required: true,
        trim: true
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'seller'
    },
    typeClient: {
        type: String
    },
    date: {
        type: String
    },
    month: {
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
    }
})


SellerSchema.plugin(Paginate)

const SellerModel = mongoose.model('sales', SellerSchema)

module.exports = SellerModel;
