'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Anuncio = mongoose.model('Anuncio');
const upload = require('../../lib/uploadConfig');
const cote = require('cote');
const path = require('path');

router.get('/', (req, res, next) => {

  const start = parseInt(req.query.start) || 0;
  const limit = parseInt(req.query.limit) || 1000; // nuestro api devuelve max 1000 registros
  const sort = req.query.sort || '_id';
  const includeTotal = req.query.includeTotal === 'true';
  const filters = {};
  if (typeof req.query.tag !== 'undefined') {
    filters.tags = req.query.tag;
  }

  if (typeof req.query.venta !== 'undefined') {
    filters.venta = req.query.venta;
  }

  if (typeof req.query.precio !== 'undefined' && req.query.precio !== '-') {
    if (req.query.precio.indexOf('-') !== -1) {
      filters.precio = {};
      let rango = req.query.precio.split('-');
      if (rango[0] !== '') {
        filters.precio.$gte = rango[0];
      }

      if (rango[1] !== '') {
        filters.precio.$lte = rango[1];
      }
    } else {
      filters.precio = req.query.precio;
    }
  }

  if (typeof req.query.nombre !== 'undefined') {
    filters.nombre = new RegExp('^' + req.query.nombre, 'i');
  }

  Anuncio.list(filters, start, limit, sort, includeTotal, function (err, anuncios) {
    if (err) return next(err);
    res.json({ ok: true, result: anuncios });
  });
});

// Return the list of available tags
router.get('/tags', function (req, res) {
  res.json({ ok: true, allowedTags: Anuncio.allowedTags() });
});

// POST /
// Añadir un anuncio
router.post('/', upload.single('foto'), (req, res, next) => {
  console.log(req.body);

  const data = req.body;
  console.log('upload:', req.file);
  data.foto = req.file.filename;
  data.tags = req.body.tags.split(",");
  if (data.venta == "venta") {
    data.venta = true;
  }
  else {
    data.venta = false;
  }

  // creamos documento de anuncio en memoria
  const anuncio = new Anuncio(data);

  // lo persistimos en la base de datos
  anuncio.save((err, anuncioGuardado) => { // .save es método de instancia
    if (err) {
      next(err);
      return;
    }
    res.json({ success: true, result: anuncioGuardado });
  });
  const requester = new cote.Requester({ name: 'creacion de thumbnails responder' });



  requester.send({
    type: 'resize',
    name: anuncio.foto
  }, res => {
    console.log('thumbnail es', res);
  });;


  // DELETE /
  // Elimina un anuncio
  router.delete('/:id', async (req, res, next) => {
    try {
      const _id = req.params.id;
      await Anuncio.remove({ _id: _id }).exec(); // .remove es método estático
      res.json({ success: true });
    } catch (err) {
      next(err);
      return;
    }
  });

  // PUT /
  // Actualiza un anuncio
  router.put('/:id', async (req, res, next) => {
    try {
      const _id = req.params.id;
      const data = req.body;

      const anuncioActualizado = await Anuncio.findByIdAndUpdate(_id, data, {
        new: true // esto es para obtener la nueva versión del documento
        // tras actualizarlo
      });

      res.json({ success: true, result: anuncioActualizado });

    } catch (err) {
      next(err);
      return;
    }
  });





});

module.exports = router;
