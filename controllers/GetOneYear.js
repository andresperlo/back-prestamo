const FormModel = require('../models/PrestamosModel');

exports.GetYear = async (req, res) => {
    try {
        const { body } = req

        const year = await FormModel.find({ year: body.year }).select('-_id -roleType -token -__v');

        if (!year) {
            return res.status(400).json({ mensaje: 'No se encuentra la fecha en la base de datos' })
        }
        res.send(year)
    } catch (err) {
        res.status(500).send(err);
    }
}