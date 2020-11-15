require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
app.use(morgan('dev'))
const cors = require('cors')
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'))

require('./dataBase')
app.set('port', process.env.PORT || 3001)
const Routes = require('./routes')

app.use('/api/v1', Routes)
app.use(function (req, res, next) {
   
    res.status(404).json({ mensaje: 'ERROR: 404 not found index' })
})

app.listen(app.get('port'), () => console.log(`Escuchando http://localhost:${app.get('port')}`))
