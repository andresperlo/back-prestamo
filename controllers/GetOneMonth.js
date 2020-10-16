const FormModel = require('../models/PrestamosModel');

exports.GetMonth = async (req, res) => {
    try {
        const { body } = req

        const month = await FormModel.find({ month: body.month }).select('-_id -roleType -token -__v');

        if (!month) {
            return res.status(400).json({ mensaje: 'No se encuentra la fecha en la base de datos' })
        }
        res.send(month)
    } catch (err) {
        res.status(500).send(err);
    }
}