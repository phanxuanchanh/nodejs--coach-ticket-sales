const express = require('express');
const session = require('express-session');
const expressValidator = require("express-validator");
const app = express();
const handlebars = require('express-handlebars');
const methodOverride = require('method-override');
const path = require('path');

require('dotenv').config();

app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: 'somesecret',
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

// config MongoDB
const db = require('./configs/mongodb');
db.connect();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());
app.use(methodOverride('method'));


const hbs = handlebars.create({extname: 'hbs'});
app.engine('hbs', hbs.engine);

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

const homeRoute = require('./routes/homeRoute');
const customerRoute = require('./routes/customerRoute');
const adminRoute = require('./routes/adminRoute');
const employeeRpoute = require('./routes/employeeRoute');

app.use('/', homeRoute);
app.use('/customer', customerRoute);
app.use('/admin', adminRoute);
app.use('/employee', employeeRpoute);

app.set('port', process.env.PORT || 8000);

var server = app.listen(app.get('port'), function () {
    console.log('- \'QuanLyDichVuXeKhach\' listening on port ' + server.address().port);
});