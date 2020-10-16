const FormModel = require('../models/PrestamosModel');
exports.GetOneDate = async (req, res) => {
    try {
        const { body } = req

        const date = await FormModel.find({ date: body.date }).select('-_id -roleType -token -__v');
       
        if (!date) {
            return res.status(400).json({ mensaje: 'No se encuentra la fecha en la base de datos' })
        }
        res.send(date)
    } catch (err) {
        res.status(500).send(err);
    }
}