const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const authJwt = require('./helpers/jwt');
const app = express();

require('dotenv/config');

app.use(cors());
app.options('*', cors());

//middleware
app.use(bodyParser.json());
app.use(morgan('tiny'));
app.use(authJwt());
app.use((error, req, res, next) => {
    res.status(error.status).json(error);
});

//Routes
const productsRoutes   = require('./routers/products');
const categoriesRoutes = require('./routers/categories');
const ordersRoutes     = require('./routers/orders');
const userssRoutes     = require('./routers/users');

const api = process.env.API_URL;

app.use(`${api}/products`, productsRoutes);
app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/orders`, ordersRoutes);
app.use(`${api}/users`, userssRoutes);

//Database
mongoose
   .connect(process.env.CONNECTION_STRING, { 
      useUnifiedTopology: true,
      dbName: process.env.DB_NAME
   })
   .then(() => app.listen(3000, () => {
      console.log('Server is running on http://localhost:3000');
   }))
   .catch(err => console.log('Connect to MongoDB error', err));

