const jsonwebtoken = require('jsonwebtoken');
const AdminModel = require('../models/CreateAdminModel');
const SellerModel = require('../models/AdminModel');

module.exports = (role) => async (req, res, next) => {

    try {

        console.log('entra en AdmimLogout')
        const token = req.header('Authorization').replace('Bearer ', '');
        const verificar = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        
        const AdminLogin = await AdminModel.findOne({ _id: verificar.user.id, token: token });
        const SellerLogin = await SellerModel.findOne({ _id: verificar.user.id, token: token })

        if (!AdminLogin && !SellerLogin) {
            return res.status(401).json({ mensaje: 'Dentro: No Autorizado' })
        }
        if (typeof role === 'string' && verificar.user.role !== role) {
            return res.status(401).json({ mensaje: 'Dentro: No Autorizado' })

        } else if (Array.isArray(role) && !role.includes(verificar.user.role)) {
            return res.status(401).json({ mensaje: 'Dentro: No Autorizado' })
        }
        res.locals.user = AdminLogin ? AdminLogin : SellerLogin,
        res.locals.token = token;
        
        console.log('El Roles es Admin o Seller? ->',res.locals.user.roleType)
        
        next();
    }
 
    catch (error) {
        console.log('error de authLogout ->', error)
        return res.status(401).json({ mensaje: 'Fuera: No Autorizado', error: error.message })
    }
}
