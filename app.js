const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv/config')

const jwt = require('./helpers/jwt')
const errorHandler = require('./helpers/error-handler')

app.use(cors());
app.options('*', cors())

// middleware
//app.use(bodyParser.json())
app.use(morgan('tiny'))
app.use(jwt)
app.use('/public/uploads', express.static(__dirname + '/public/uploads'))
app.use(errorHandler);

// Routes
const categoriesRoutes = require('./routes/categories')
const productsRoutes = require('./routes/products')
const usersRoutes = require('./routes/users')
const ordersRoutes = require('./routes/orders')

const api = process.env.API_URL;

app.use(`${api}/categories`, categoriesRoutes)
app.use(`${api}/products`, productsRoutes)
app.use(`${api}/users`, usersRoutes)
app.use(`${api}/orders`, ordersRoutes)

// Database
mongoose.connect(process.env.CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'pharmacy-shop'
})
  .then(() => {
    console.log('Database connection is ready...')
  }).catch((err) => {
    console.log(err)
  })

// Development
/*app.listen(3000, () => {
  console.log('server is running on port http://localhost:3000')
})*/

// Production
var server = app.listen(process.env.PORT || 3000, function () {
  var port = server.address().port
  console.log("Express is working on port " + port)
})