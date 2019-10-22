let jwt = require('jsonwebtoken');
let config = require('./config');
let MongoClient = require('mongodb').MongoClient;

const url = "mongodb://localhost:27017"

// Clase encargada de la creación del token
class HandlerGenerator {

    login(req, res) {

        // Extrae el usuario y la contraseña especificados en el cuerpo de la solicitud
        var username = req.body.username;
        var password = req.body.password;
        var md5 = require("md5");
        var hashPassword = md5(password);
        // Este usuario y contraseña, en un ambiente real, deben ser traidos de la BD
        /*
                let mockedUsername = 'admin';
                let mockedPassword = 'password';
        */
        let mockedUsername = ''
        let mockedPassword = ''

        if (username && password) {

            var conn = MongoClient.connect(url,
                { useNewUrlParser: true, useUnifiedTopology: true });

            conn.then(client => {
                console.log("Adentro de la promesa de conexion.")
                let usuario = {
                    "username": username,
                    "password": hashPassword
                }
                console.log(usuario);
                let resp = client.db("jwttest").collection("users").findOne(usuario);
                resp.then((val) => {
                    console.log(`Respuesta al encontrar registro en MongoDB: ${val}`);
                    let user = val;
                    console.log(user);
                    if (user) { //Si el objeto no es vacio continue
                        // Se genera un nuevo token para el nombre de usuario el cuál expira en 24 horas
                        let token = jwt.sign({ username: username },
                            config.secret, { expiresIn: '24h' });

                        // Retorna el token el cuál debe ser usado durante las siguientes solicitudes
                        res.json({
                            success: true,
                            message: 'Authentication successful!',
                            token: token
                        });
                    } else {
                        // El error 403 corresponde a Forbidden (Prohibido) de acuerdo al estándar HTTP
                        res.status(403).json({
                            success: false,
                            message: 'Incorrect username or password'
                        });

                    }

                }).catch(err => {
                    console.log(err);
                });
            });
        } else {
            // El error 400 corresponde a Bad Request de acuerdo al estándar HTTP
            res.status(400).json({
                success: false,
                message: 'Authentication failed! Please check the request'
            });
        }

    }

    signup(req, res) {
        console.log("entro al metodo")
        var conn = MongoClient.connect(url,
            { useNewUrlParser: true, useUnifiedTopology: true });

        console.log(`Username: ${req.body.username}`);
        var md5 = require('md5');
        let passwordHash = md5(req.body.password);
        console.log(`Password hash: ${passwordHash}`);

        conn.then(client => {
            let usuario = {
                "username": req.body.username,
                "password": passwordHash
            }
            let response = client.db("jwttest").collection("users").insertOne(usuario);
            response.then(value => {
                res.json(value);
                //callback(pais);
            });
        });
    }

    index(req, res) {

        // Retorna una respuesta exitosa con previa validación del token
        res.json({
            success: true,
            message: 'Index page'
        });

    }
}

module.exports = HandlerGenerator;