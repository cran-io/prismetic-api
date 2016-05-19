var express    = require('express');
var app        = express();
var server     = require('http').Server(app);
var cors       = require('cors');
var bodyParser = require('body-parser');
var mongoose   = require('mongoose');
var io         = require('socket.io')(server);
var expressSession = require('express-session');
var morgan = require('morgan');

mongoose.connect('mongodb://localhost/raspberry-api-dev');
mongoose.set('debug', true);
// mongoose.connect('mongodb://raspi:raspi@ds011261.mlab.com:11261/iot-raspi-db');
// If the connection throws an error
mongoose.connection.on('error',function (err) {  
  console.log('Mongoose default connection error: ' + err);
}); 

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {  
  console.log('Mongoose default connection disconnected'); 
});

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Passport Session
var passport = require('./app/config/passport')
app.use(expressSession({secret: 'myPrismaticApiKey', resave: true, saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());
app.use(morgan('dev'))

//Defining Routes.
var routes = require('./app/routes/routes')(io, passport);
app.use('/', routes);

server.listen(process.env.PORT || 8080, function() {
  console.log("Server listen at port: 8080");
});

io.on('connection', function(socket) {
  console.log('User ' + socket.id + ' connected at ' + Date.now());
  socket.on('disconnect', function() {
    console.log('User disconnected at ' + Date.now());
  });
});

