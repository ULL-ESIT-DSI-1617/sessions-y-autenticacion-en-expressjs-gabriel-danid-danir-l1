//authsession.js
"use strict";
let express = require('express'),
    app = express(),
    session = require('express-session');
let cookieParser = require('cookie-parser');
let path = require('path');
let util = require("util");
var bodyParser = require('body-parser');
var fs = require('fs');
var results = JSON.parse(fs.readFileSync('usuarios.json', 'utf8'));


//
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


//

// middleware

app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  secret: 'shhhh, very secret'
}));

let bcrypt = require("bcrypt-nodejs");
let hash = bcrypt.hashSync("amyspassword");

let instructions = `
Visit these urls in the browser:
<ul>
  <li> <a href="http://localhost:8080/content">localhost:8080/content</a> </li>
  <li> <a href="http://localhost:8080/content/chapter1.html">localhost:808/content/chapter1.html</a> </li>
  <li> <a href="http://localhost:8080/login?username=juan&password=juanpassword">localhost:8080/login?username=juan&password=juanpassword</a> </li>
  <li> <a href="http://localhost:8080/login?username=pedro&password=pedropassword">localhost:8080/login?username=pedro&password=pedropassword</a> </li>
  <li> <a href="http://localhost:8080/login?username=antonio&password=antoniopassword">localhost:8080/login?username=antonio&password=antoniopassword</a> </li>
  <li> <a href="http://localhost:8080/login?username=amy&password=amyspassword">localhost:8080/login?username=amy&password=amyspassword</a> </li>
  <li> <a href="http://localhost:8080/logout">localhost:8080/logout</a> </li>
</ul>
`;



let layout = function(x) { return x+"<br />\n"+instructions; };

app.use(cookieParser());
app.use(session({
    secret: '2C44-4D44-WppQ38S',
    resave: true,
    saveUninitialized: true
}));
 
app.use(function(req, res, next) {
  console.log("Cookies :  "+util.inspect(req.cookies));
  console.log("session :  "+util.inspect(req.session));
  next();
});

app.get('/change', function (req, res, next) {
 res.render('change');
});
app.post('/change', function (req, res) {
	

	var configFile =fs.readFileSync('./usuarios.json');
	
	var config =JSON.parse(configFile);
	var file = require('./usuarios.json');

	
	for(var i in config){

			
		if(config[i].username == req.body.username){
			
			if(bcrypt.compareSync(req.body.password, config[i].password)){
			
			config[i].password = bcrypt.hashSync(req.body.NewPassword);
			
			fs.writeFile('./usuarios.json', JSON.stringify(config), function (err) {
  			if (err) return console.log(err);
  				console.log(JSON.stringify(file));
  				console.log('writing to ' + './usuarios.json');
			});
			}
	}
	}
  
});


app.get('/login', function (req, res, next) {
 res.render('login');
});




// Authentication and Authorization Middleware
let auth = function(req, res, next) {
  if (req.session && req.session.user in users)
    return next();
  else
    return res.sendStatus(401); // https://httpstatuses.com/401
};
 
// Login endpoint
app.post('/login', function (req, res) {
	/*

config[i].password = "new value";

fs.writeFile('./usuarios.json', JSON.stringify(config), function (err) {
  if (err) return console.log(err);
  console.log(JSON.stringify(file));
  console.log('writing to ' + fileName);
});
	*/
console.log(bcrypt.hashSync("danipassword"));
console.log(bcrypt.hashSync("pepepassword"));
	var configFile =fs.readFileSync('./usuarios.json');
	
	var config =JSON.parse(configFile);
	var contraseña_bool =0;
	

	
	for(var i in config){
		if(config[i].username == req.body.username){
			if(bcrypt.compareSync(req.body.password, config[i].password)){
				contraseña_bool = 1;
			}
	}
	}
  if (!req.body.username || !req.body.password) {
    console.log('login failed');
    res.send('login failed');    
  }else if(contraseña_bool){
    req.session.user = req.body.username;
    req.session.admin = true;
    res.send(layout("login success! user "+req.session.user));
  } else {
    console.log(`login ${util.inspect(req.body)} failed`);    
    res.send(layout(`login ${util.inspect(req.body)} failed. You are ${req.session.user || 'not logged'}`));    
  }
});
 
app.get('/', function(req, res) {
  res.send(instructions);
});
// Logout endpoint
app.get('/logout', function (req, res) {
  req.session.destroy();
  res.send(layout("logout success!"));
});
 
// Get content endpoint
app.get('/content/*?', 
    auth  // next only if authenticated
);
 
app.use('/content', express.static(path.join(__dirname, 'public')));



app.listen(8080);
console.log("app running at http://localhost:8080");

