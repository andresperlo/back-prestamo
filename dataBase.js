const mongoose = require('mongoose')

mongoose.connect(
    process.env.mongodb, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}, (err) => {
    if (err) {
       console.log('No Anda el server ',err)
    } else{
        console.log('Atlas listo')
    }
})