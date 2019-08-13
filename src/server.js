const express = require('express');
const app = express();

const { log } = require('./controller');

const PORT = process.env.PORT || 8899; 

app.listen(PORT, () => {
    log('Servidor rodando: ' + PORT);
});


app.get('*', (req, res) => {
    res.json({
        name: "Chorão"
    })
})