const mongoose = require('mongoose');
const FormModel = require('../models/PrestamosModel');

exports.getSales = async (req, res) => {

    try {

        const allSales = await FormModel.find({ seller: res.locals.user.id})
        .select('-_id -__v')
        .populate('seller', '-_id, nombreVendedor')
        
        res.send(allSales)
        console.log('allSales ->',allSales)
    } catch (err) {
        res.status(500).send(err);
    }
}
