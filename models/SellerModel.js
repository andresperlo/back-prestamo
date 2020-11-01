const mongoose = require('mongoose')
const Paginate = require('mongoose-paginate-v2')
const { paginate } = require('./AdminModel')

const SellerSchema = new mongoose.Schema({

    sellerName: {
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
        type: Boolean,
        trim: true,
        required: true
    },
    nameClient: {
        type: String,
        trim: true,
        required: true
    },
    dniClient: {
        type: Number,
        trim: true,
        unique: true,
        required: true
    },
    celphoneClient: {
        type: Number,
        required: true,
        trim: true,
    },
    amountApproved: {
        type: Number,
        required: true,
        trim: true
    },
    quotaAmount: {
        type: Number,
        required: true,
        trim: true
    },
    feeAmount: {
        type: Number,
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
        type: Boolean,
        required: true,
        default: true
    }
})


SellerSchema.plugin(Paginate)

const SellerModel = mongoose.model('sales', SellerSchema)

module.exports = SellerModel;
