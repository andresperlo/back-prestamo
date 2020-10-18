const jsonwebtoken = require('jsonwebtoken');
const AdminCModel = require('../models/CreateAdminModel');

module.exports = (role) => async (req, res, next) => {
  
    try {
        console.log('role->', role);
        console.log('role->', typeof role);
        const token = req.header('Authorization').replace('Bearer ', '');
        
        const verificar = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        console.log('verificar user->', verificar.user.role);

        const userLogin = await AdminCModel.findOne({ _id: verificar.user.id, token: token });
        console.log('userLogin ->',userLogin)
        if (!userLogin) {
            return res.status(401).json({ mensaje: 'Dentro: No Autorizado' })
        }
        if (typeof role === 'string' && verificar.user.role !== role) {
            return res.status(401).json({ mensaje: 'Dentro: No Autorizado' })

        } else if (Array.isArray(role) && !role.includes(verificar.user.role)) {
            return res.status(401).json({ mensaje: 'Dentro: No Autorizado' })
        }

        res.locals.user = userLogin;
        res.locals.token = token;
       console.log('dentro de auth ->',userLogin);
        next();
    }

    catch (error) {
        return res.status(401).json({ mensaje: 'Fuera: No Autorizado', error: error.message })
    }
}
