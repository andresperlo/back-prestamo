const mongoose = require('mongoose');
const FormModel = require('../models/PrestamosModel');

exports.getSalesAdmin = async (req, res) => {

    try {

        const allSales = await FormModel.find({}).select('-_id -__v')
        
        res.send(allSales)
    } catch (err) {
        res.status(500).send(err);
    }
}
