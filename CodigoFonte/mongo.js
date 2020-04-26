let expp = {};

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const URL_MONGO =
    process.env.MONGO_URI || "mongodb+srv://cluster0-xwbzh.gcp.mongodb.net/test";

const options = {
    autoIndex: true, // Don't build indexes
    reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
    reconnectInterval: 500, // Reconnect every 500ms
    poolSize: 10, // Maintain up to 10 socket connections
    bufferMaxEntries: 0,
    keepAlive: true,
    useNewUrlParser: true,
    user: process.env.MONGO_USER || "admin",
    pass: process.env.MONGO_PASS || "admin"
};

mongoose.disconnect();

mongoose.Promise = require('bluebird');

const connectWithRetry = () => {
    mongoose.connect(URL_MONGO, options).then(
        () => {
            console.log('Succeeded connected to: ' + URL_MONGO);
        },
        err => {
            console.log('ERROR connecting to: ' + URL_MONGO + '. ' + err);
        }
    );
}

connectWithRetry();

let usuariosDS = new Schema({
    email: {
        type: String
    },
    password: {
        type: String
    },
    data: {
        type: Date,
        default: Date.now
    },
    nome: {
        type: String
    },
    identidade: {
        type: String
    },
    nivelEscolar: {
        type: String
    },
    temasInteresse: {
        type: String
    },
}, {
    collection: 'usuarios'
});

expp.Usuarios= mongoose.model('Usuarios', usuariosDS);

let cientistasDS = new Schema({
    email: {
        type: String
    },
    password: {
        type: String
    },
    data: {
        type: Date,
        default: Date.now
    },
    nome: {
        type: String
    },
    dataNascimento: {
        type: Date
    },
    dataTrabalho: {
        type: Date
    },
    cidade: {
        type: String
    },
    estado: {
        type: String
    },
    localPesquisa: {
        type: String
    },
    nivelFormacao: {
        type: String
    },
    link: {
        type: String
    },
}, {
    collection: 'cientistas'
});

expp.Cientistas = mongoose.model('Cientistas', cientistasDS);

module.exports = expp;