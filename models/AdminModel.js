const mongoose = require('mongoose');
const Paginate = require('mongoose-paginate-v2')
// let aggregatePaginate = require('mongoose-aggregate-paginate-v2');

const AdminSchema = new mongoose.Schema({  
    fullname:{
        type: String,
        trim: true,
        required:true,
        uppercase: true
    },
    dni:{
        type: String,
        trim: true,
        unique: true,
        required:true  
    },
    address:{
        type: String,
        trim: true,
        required:true, 
        uppercase: true
    },
    celphone: {
        type: String,
        required: true,
        trim: true,
    },
    email:{
        type: String,
        trim: true,
        required:true,
        unique: true,
        uppercase: true
    },
    user:{
        type: String,
        trim: true,
        required:true,
        unique: true,
        lowercase: true
    },
    password:{
        type: String,
        required:true,
        trim: true,
    },
    roleType:{
        type: String,
        default: 'seller',
        required:true
    },
    enable:{
        type: String,
        required: true,
        default: "SI"
    },
    token: [String],
    
    sales:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'montotal'
    }],
})

AdminSchema.plugin(Paginate)
 
const AdminModel = mongoose.model('seller', AdminSchema)

module.exports = AdminModel;
