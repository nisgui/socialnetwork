const express = require('express');
const router = express.Router();
const Mongo = require('./mongo');
const HttpStatus = require('http-status-codes');

router.get('/usuario/:email', async (req, res) => {

    try {

        let doc = await Mongo.Usuarios.findOne({
            email: req.params.email
        })

        console.log(doc)
        if (!doc) {
            return res.status(HttpStatus.NOT_FOUND).json();
        }

        return res.status(HttpStatus.OK).json(doc);

    } catch (e) {

        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(e.toString());

    }

});
router.post('/usuario', async (req, res) => {

    try {

        if (!req.body) {
            res.status(HttpStatus.BAD_REQUEST).json();
        }

        const doc = await Mongo.Usuarios.findOneAndUpdate({
            "email": req.body.email
        }, req.body, {
            upsert: true,
            new: true,
            runValidators: true
        });

        return res.status(HttpStatus.OK).json(doc);

    } catch (e) {

        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(e.toString());

    }

});

router.post('/auth', async (req, res) => {

    try {

        console.log(req.body)

        const docUsuario = await Mongo.Usuarios.findOne({
            email: req.body.email,
            password: req.body.password,
        });

        const docCientista = await Mongo.Cientistas.findOne({
            email: req.body.email,
            password: req.body.password,
        });

        if (!docCientista && !docUsuario) {
            return res.status(HttpStatus.UNAUTHORIZED).json();
        }

        let doc = {};
        if (docCientista) {
            doc.nome = docCientista.nome;
            doc.tipo = "CIENTISTA"
        } else {
            doc.nome = docUsuario.nome;
            doc.tipo = "MEMBRO"
        }

        return res.status(HttpStatus.OK).json(doc);

    } catch (e) {

        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(e.toString());

    }
    


    
});
router.post('/cientista', async (req, res) => {

    try {

        console.log(req.body)

        const doc = await Mongo.Cientistas.findOneAndUpdate({
            "email": req.body.email
        }, req.body, {
            upsert: true,
            new: true,
            runValidators: true
        });


        

       

        return res.status(HttpStatus.OK).json(doc);

    } catch (e) {

        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(e.toString());

    }
});




module.exports = app => app.use('/', router);