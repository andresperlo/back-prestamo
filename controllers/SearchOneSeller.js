const FormModel = require('../models/PrestamosModel');
exports.SearchOneSeller = async (req, res) => {
    try {
        const { body } = req

        const seller = await FormModel.find({ nombreVendedor: body.nombreVendedor }).select('-_id -roleType -token -__v');
        if (!seller) {
            return res.status(400).json({ mensaje: 'No se encuentra al Vendedor en la base de datos' })
        }
        res.send(seller)
    } catch (err) {
        res.status(500).send(err);
    }
}