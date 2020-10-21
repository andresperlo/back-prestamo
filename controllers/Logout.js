const AdminModel = require('../models/CreateAdminModel');
const SellerModel = require('../models/AdminModel');

exports.Logout = async (req, res) => {
    try {
        const role = res.locals.user.roleType

        if(role == 'admin'){
           await AdminModel.updateOne({ _id: res.locals.user.id }, { $set: { token: [] } })
        } else if(role == 'seller'){
           await SellerModel.updateOne({ _id: res.locals.user.id }, { $set: { token: [] } })
        }

        console.log('id Admin o Seller? ->',res.locals.user.roleType)
        
     res.json({ mensaje: 'Deslogueo ok' }) 
   } catch (error) {
       console.log('error Logout Amin ->', error)
       res.status(500).send({ mensaje: 'Error', error })
   }
} 
