'use strict';
//Servicio para crear thumbnail
const path = require("path");
const cote = require('cote');
const jimp = require("jimp");

const responder = new cote.Responder({ name: 'creacion de thumbnails responder' });

responder.on('resize', (req, done) => {

  Jimp.read(path.join(__dirname, '../public/images/anuncios' + req.name)).then(function (foto) {
    return foto.resize(100, 100)     // resize
      .quality(60)                 // set JPEG quality
      .write(path.join(__dirname, '../public/images/anuncios/thumbnails' + 'thumbnail-' + req.name)); // save
  }).catch(function (err) {
    console.error(err);
  });

  done('thumbnail creado');

});

