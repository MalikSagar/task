
//node js modules---------------------------------------------------------------
var express =require('express');
var app=express();
var path=require('path');
var layout =require('express-layout');
var engine=require('ejs-mate');
var bodyparser=require('body-parser');
var mysql = require('mysql');
const multer = require('multer');
//-----------------------------------initial envirnment for node js------------------------------
app.use(bodyparser.json({limit: '1000mb'}));
app.use(bodyparser.urlencoded({
	limit: '1000mb',extended:false
}))
var middleware=[
	layout(),
	express.static(path.join(__dirname,'public'))
]
//------------------------------------sql connectivity--------------------------------------------
var con = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "",
	database: "test"
  });
  con.connect(function(err) {
	if (err) throw err;
	console.log("Sql Connected! on query");
  });
//--------------------------------------unique string maker------------------------------------
  function makeid(length) {
	var result           = '';
	var characters       = '0123456789';
	var charactersLength = characters.length;
	for ( var i = 0; i < length; i++ ) {
	   result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
  }

 //--------------------------------initial envirment for file upload---------------------------- 
  var Filename="";
  var org_Name="";
  
var storage =   multer.diskStorage({
	destination: function (req, file, callback) {
		
		var dir=path.join('./public/Files');
		callback(null, dir);
	},
	filename: function (req, file, callback) {
		
		//Filename='rubus.network' + uniqueString();
		org_Name=file.originalname.toLowerCase().split(' ').join('-');
	    Filename=makeid(9)+file.originalname.toLowerCase().split(' ').join('-');
		callback(null , Filename );
	}
});

var upload = multer({ storage : storage,limits:{fileSize:10*1024*1024}}).single('userfile');



//-------------------------------------------------document load api---------------------------------
app.get('/user-dash-board/document_open/:id',function(req,res){

	con.query("SELECT * FROM document WHERE id=?",[
		req.params.id
	 ], function (err, found) {
		 console.log('result:',found);
	res.render('user-dash-board/document_open',{
		path:found[0].path,
		name:found[0].name,
		wait:"no",
		});
	})

});
//------------------------------------------document delete api--------------------------------------
app.get('/user-dash-board/delete_document/:id',function(req,res,next){
	
			con.query("DELETE FROM document WHERE id=?",[
				req.params.id
			], function (err, result) {
				if (err) throw err;
				res.redirect('/user-dash-board/document');
			
			});
})
//---------------------------------------------document upload api for frontend side----------------------------------
app.get('/user-dash-board/document_file_upload',function(req,res){

 res.render('user-dash-board/document_file_upload');
	
});
//-------------------------------------------document file upload backend api--------------------------
app.post('/document_upload',async function(req,res,next){
	   
		upload(req,res,function(err) {

			if(err) {
			console.log('error:',err);
					return res.end("Error uploading file.");
			}
			else
			{
				//res.redirect('user-dash-board/document')
				var full_path='Files/'+Filename;
				var sql = "INSERT INTO document (path,name) VALUES ('"+full_path+"','"+org_Name+"')";
							con.query(sql, function (err, result) {
								if (err) throw err;
								console.log("1 record inserted");
							})
				res.json({ success: 'ok'});
			}
		})
})
//-----------------------------------api to show all stored docuemnt in our db------------------------
app.get('/user-dash-board/document',function(req,res){
	con.query("SELECT * FROM document", function (err, result) {
		if (err) throw err;
		res.render('user-dash-board/document',{
			document: result
		});
	})
})
//---------------------------------------middle ware functionals---------------------------------------
app.use(middleware);
app.engine('ejs',engine);
app.set('view engine','ejs');
app.listen(3001, function(){
	console.log("Server started on Port 3001");
})