const jsonwebtoken = require('jsonwebtoken');
const AdminModel = require('../models/CreateAdminModel');
const SellerModel = require('../models/AdminModel');

module.exports = (role) => async (req, res, next) => {

    try {

        const token = req.header('Authorization').replace('Bearer ', '');
        console.log('token->', token)
        const verificar = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        console.log('verificar', verificar)
        
        const AdminLogin = await AdminModel.findOne({ _id: verificar.user.id, token: token });
        console.log('admin->', AdminLogin)
        const SellerLogin = await SellerModel.findOne({ _id: verificar.user.id, token: token })
        console.log('seller ->', SellerLogin)
        
        if (!AdminLogin && !SellerLogin) {
            console.log('aqui falla 1')
            return res.status(401).json({ mensaje: 'Dentro: No Autorizado' })
        }
        if (typeof role === 'string' && verificar.user.role !== role) {
            console.log('aqui falla 2')
            return res.status(401).json({ mensaje: 'Dentro: No Autorizado' })

        } else if (Array.isArray(role) && !role.includes(verificar.user.role)) {
            console.log('aqui falla 3')
            return res.status(401).json({ mensaje: 'Dentro: No Autorizado' })
        }
        res.locals.user = AdminLogin ? AdminLogin : SellerLogin,
        res.locals.token = token;
                
        next();
    }
 
    catch (error) {
        console.log(error)
        return res.status(401).json({ mensaje: 'Fuera: No Autorizado', error: error.message })
    }
}
