var FCM = require('fcm-node');
var temp="MyNotification";
const util = require('util')
var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var path = require('path');
var formidable = require('formidable')

var serverKey = 'AIzaSyDPKfhsLXT4xxUijIL9jU4T3IW6JgDfSNo';
var fcm = new FCM(serverKey);
var mysql      = require("mysql");
var fs = require('fs');
var uploadfname;
var upurl ;


var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'vmapp'
});


connection.connect(function(err){
	if(!err) {
		console.log("connected ... \n\n");  
	} else {
		console.log("Error connecting database ... \n\n");  
	}
});

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); 

app.get('/listen/:uploadfname',function(req,res){
	console.log("Listen!");
	var myfname=(__dirname+"/uploads/"+req.params.uploadfname);
	res.sendFile(myfname);
	console.log(">>"+req.params.uploadfname);
});

app.post('/postupload',function(req,res){
	
	
	console.log("my Token is:-->>>",req.body.getsendToken);
	console.log("my no is:-->>>",req.body.getsendNo);
	
	var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
    to: req.body.getsendToken, 
    collapse_key: 'your_collapse_key',
   
    notification: {
        title: 'You have VM from:'+req.body.getsendNo, 
        body: 'http://192.168.0.61:8086/listen/'+uploadfname
    },
    
    /*data: {  //you can send only notification or only data(or include both)
        my_key: 'my value',
        my_another_key: 'my another value'
    }*/
};

fcm.send(message, function(err, response){
    if (err) {
        console.log("Something has gone wrong!");
    } else {
        console.log("Successfully sent with response: ", response);
    }
});

	
});

//get contacts 

app.post('/getcontacts',function(req,res){
	var j = JSON.parse(req.body.name);
	var arr =[];
	//console.log("Request",j);
						
	       connection.query('SELECT contact,password from user', function(err, rows, fields){
			   for(var s in rows)
			   {
				   for(var i =0;i<j.length;i++)
				   {
					   if(j[i]==rows[s].contact)
					   {
						   console.log("MAtched VAlues"+rows[s].contact);
						  // arr.push(rows[s].contact);
						  arr.push({
                               no: rows[s].contact,
                               token: rows[s].password
                                 });  // add a new object
						   
					   }
					  
				   }
				  
				   
			   }
             console.log("Array:->>>",arr);
		    res.send(arr);
			
			
	});	
	

});


//refresh contacts

app.post('/refcontacts',function(req,res){
	var j = JSON.parse(req.body.refname);
	var arr =[];
	connection.query('SELECT contact,password from user', function(err, rows, fields){
    for(var s in rows)
    {
		for(var i=0;i<j.length;i++)
		{
			if(j[i]==rows[s].contact)
					   {
						   console.log("MAtched VAlues"+rows[s].contact);
						  // arr.push(rows[s].contact);
						  arr.push({
                               no: rows[s].contact,
                               token: rows[s].password
                                 });  // add a new object
						   
					   }
					   else
					   {
						   console.log("No need to refreshed");
					   }
					   
					   
		}
	}
						
	    console.log("Array:->>>",arr);
		    res.send(arr);   
	});	
});
	


//register user
app.post('/postuser',function(req,res){
	var data = { 
				username:req.body.username,
				
				email: req.body.email,
				contact:req.body.contact,
				password: req.body.password
				
				};

	console.log(data);

	connection.query('INSERT INTO user SET ?', data, function(err, rows, fields) {
		
		if (!err)
			console.log('The solution is: ', rows);
		else
			console.log(err);
	});
});



// register user

app.post('/postuser',function(req,res){
	var data = { 
				username:req.body.username,
				
				email: req.body.email,
				contact:req.body.contact,
				password: req.body.password
				
				};

	console.log(data);

	connection.query('INSERT INTO user SET ?', data, function(err, rows, fields) {
		
		if (!err)
			console.log('The solution is: ', rows);
		else
			console.log(err);
	});
});



app.post('/upload', function(req, res){

  // create an incoming form object
  var form = new formidable.IncomingForm();

  // specify that we want to allow the user to upload multiple files in a single request
  form.multiples = true;

  // store all uploads in the /uploads directory
  form.uploadDir = "./uploads";
 

  // every time a file has been uploaded successfully,
  // rename it to it's orignal name
  form.on('file', function(field, file) {
    fs.rename(file.path, path.join(form.uploadDir, file.name));
	console.log(__dirname + "/uploads/"+file.name);
	upurl=__dirname + "/uploads/"+file.name;
	uploadfname=file.name;
	//res.sendFile(__dirname+path.join(form.uploadDir, file.name));
  });

  // log any errors that occur
  form.on('error', function(err) {
    console.log('An error has occured: \n' + err);
  });

  // once all the files have been uploaded, send a response to the client
  form.on('end', function() {
    res.end('success');
	
	//res.sendFile(file.path);
  });

  // parse the incoming request containing the form data
  form.parse(req);

});


var server = app.listen(8086, function(){
  
});