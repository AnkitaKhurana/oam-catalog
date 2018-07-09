#!/bin/env node

require('dotenv').config();
var Conn = require('../services/db');
const Admin = require('../models/admin');

const bcrypt = require('bcrypt');

var dbWrapper = new Conn();

dbWrapper.start(createAdmin);

function createAdmin () {
  const args = process.argv.slice(2);
  const name = args[0];
  const email = args[1];
  const password = args[2];
  const hash = bcrypt.hashSync(password, 10);

  Admin.create({
    name: name,
    email: email,
    password: hash
  }).then((admin) => {
    console.log('New Made:', admin);
    dbWrapper.close();
  }).catch(function (err) {
    console.error(err);
    dbWrapper.close();
  });
}
