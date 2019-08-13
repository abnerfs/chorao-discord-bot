const express = require('express');
const app = express();

const fetch = require('node-fetch');

const { log } = require('./controller');

const PORT = process.env.PORT || 8899; 

app.listen(PORT, () => {
    log('Servidor rodando: ' + PORT);
});


//HEROKU ANTI IDLE
(() => {
    setInterval(() => {
        fetch('http://chorao-discord.herokuapp.com/')
            .catch(() => {

            })

    }, 1000 * 60 * 10)
})();

app.get('*', (req, res) => {
    res.json({
        name: "Chorão"
    })
})