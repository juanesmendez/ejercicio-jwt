let jwt = require('jsonwebtoken');
const config = require('./config.js');

let MongoClient = require('mongodb').MongoClient;

const url = "mongodb://localhost:27017"

// Función encargada de realizar la validación del token y que es directamente consumida por server.js
let checkToken = (req, res, next) => {

  // Extrae el token de la solicitud enviado a través de cualquiera de los dos headers especificados
  // Los headers son automáticamente convertidos a lowercase
  let token = req.headers['x-access-token'] || req.headers['authorization'];

  let username = req.headers['username'];
  let password = req.headers['password'];

  // Si existe algún valor para el token, se analiza
  // de lo contrario, un mensaje de error es retornado
  if (token) {
    console.log(token);
    // Si el token incluye el prefijo 'Bearer ', este debe ser removido
    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length);
      // Llama la función verify del paquete jsonwebtoken que se encarga de realizar la validación del token con el secret proporcionado
      jwt.verify(token, config.secret, (err, decoded) => {

        // Si no pasa la validación, un mensaje de error es retornado
        // de lo contrario, permite a la solicitud continuar
        if (err) {
          return res.json({
            success: false,
            message: 'Token is not valid'
          });
        } else {
          req.decoded = decoded;
          next();
        }
      });
    }
  } else if (username && password) { //Verificacion para que se pueda verificar token en la BD sin necesidad de mandarlo en el header.

    var conn = MongoClient.connect(url,
      { useNewUrlParser: true, useUnifiedTopology: true });

    var md5 = require("md5");
    password = md5(password);

    conn.then(client => {
      let resp = client.db('jwttest').collection('users').findOne({ "username": username, "password": password });
      resp.then(val => {
        let user = val;
        let token = user["token"];

        jwt.verify(token, config.secret, (err, decoded) => {

          // Si no pasa la validación, un mensaje de error es retornado
          // de lo contrario, permite a la solicitud continuar
          if (err) {
            return res.json({
              success: false,
              message: 'Token is not valid'
            });
          } else {
            req.decoded = decoded;
            next();
          }
        });
      });

    });
  } else {

    return res.json({
      success: false,
      message: 'Auth token is not supplied'
    });

  }

};

module.exports = {
  checkToken: checkToken
}