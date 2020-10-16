const mongoose = require('mongoose');
const AdminModel = require('../models/AdminModel');

exports.getSellerAdmin = async (req, res) => {

    try {

        const allSeller = await AdminModel.find({}).select('-_id -token -password -__v -usuarioVendedor -dniVendedor')
        
        res.send(allSeller)
    } catch (err) {
        res.status(500).send(err);
    }
}
