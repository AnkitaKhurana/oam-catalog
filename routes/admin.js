'use strict';

const Admin = require('../models/admin');
const jwt = require('jsonwebtoken');
const Boom = require('boom'); 

const bcrypt = require('bcrypt');
const saltRounds = 10;
const privateKey = 'AnkitaPrivate'; //Setup Private Key in Config : Later

module.exports = [

{
  method: 'GET',
  path: '/admin',
  config: {
    auth: 'jwt',
    handler: (request, h) => {
      if(request)
        h(request.auth.token);
      else
        h('Sorry Only Admins Can Login!').results //Redirect to login page here
    }
  }
},
{
  method: 'POST',
  path: '/admin',
  config: {
    auth: false,
    handler: (request, h) => {
      let name = request.payload.name;
      let password = request.payload.password;
      let token = jwt.sign({exp: Math.floor(Date.now() / 1000) + (60 * 60),data : {name: name,password:password} }, privateKey, { algorithm: 'HS256'});

      Admin.findOne({name: name}).exec(function(err,admin){
        if(err){
           h("Something went wrong");
        }
        if(admin==null)
        {
             h('Not Valid Admin Credentials'); //Redirect to Login Page  
            // Uncomment to store New Admin Credentials in Database :(Remove Later)
            // Comment above return statement 
                  /*
                  let hash = bcrypt.hashSync(password, saltRounds);
                  let Newadmin = Admin.create({
                          name: name,
                          emailId: email,
                          password: hash,
                          token : token
                  }).then(Newadmin=>{
                        console.log('New Made:',Newadmin);
                        return Newadmin;
                  }).catch(function (err) {
                      return(Boom.badImplementation(err));
                  });
                  */
                }
                var HashPass = '';
                bcrypt.compare(password,admin.password, function(err, res) {
                  if(res) {
                   admin.token = token;
                   admin.save(); 
                   h(admin);

                 } else {                                            
                  h('Not Valid Admin Credentials');
                } 
              });                 
        });
    }
  }
}

];