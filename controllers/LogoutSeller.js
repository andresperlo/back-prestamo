const AdminModel = require('../models/AdminModel');

exports.LogoutSeller = async (req, res) => {
     try {

        await AdminModel.updateOne({ _id: res.locals.user.id }, { $set: { token: [] } })
        res.json({ mensaje: 'Deslogueo ok' })
    } catch (error) {
        res.status(500).send({ mensaje: 'Error', error })
    }
} 