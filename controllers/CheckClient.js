const FormModel = require('../models/PrestamosModel');
exports.GetUser = async (req, res) => {
    try {
        const { body } = req

        const user = await FormModel.findOne({ dniCliente: body.dniCliente }).select('-_id -roleType -token -__v');
        if (!user) {
            return res.status(400).json({ mensaje: 'No se encuentra el DNI en la base de datos' })
        }
        res.send(user)
    } catch (err) {
        res.status(500).send(err);
    }
}