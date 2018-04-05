'use strict';


const fs = require('fs');
const path = require('path');

var express = require('express');
var router = express.Router();
const i18n = require('../lib/i18nConfigure')();
const sessionAuth = require('../lib/sessionAuth');
const Usuario = require('../models/Usuario');

/* GET home page. */
router.get('/', sessionAuth(), async function (req, res, next) {
  try {
    const filename = path.join(__dirname, '../README.md');
    const readme = await new Promise((res, rej) =>
      fs.readFile(filename, 'utf8', (err, data) => err ? rej(err) : res(data))
    );
    res.render('index', { readme });
  } catch (err) { return next(err); }
});

module.exports = router;
