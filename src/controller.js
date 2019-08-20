const random = require('random-number');

const  { messagesInterval } = require('../config');
const { delayedMessages, answersMention, musics } = require('./frases');
const SEGUNDO = 1000;
const MINUTO = 60 * SEGUNDO;

/**
 * @param {string} search
 * @param {replacement} replacement
 */
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};


const log = function () {
    return console.log.apply(
        console,
        ['['+new Date().toLocaleString('pt-br') +']'].concat(
            Array.prototype.slice.call(arguments)
        )
    );
};



function getRandomMessage(arr, arrOriginal) {
    if(!arr || !arr.length)
        return;

    let index = random({
        min: 0,
        max: arr.length - 1,
        integer: true
    })

    return queueMsg(index, arr, arrOriginal);
}


let arrDelayed = delayedMessages.slice(0);
let arrMentions = answersMention.slice(0);
let arrMusics = musics.slice(0);

function queueMsg(index, arr, arrOriginal) {
    let msgSend = arr.splice(index, 1)[0];
    if(arr.length == 0) {
        for(const i of arrOriginal)
            arr.push(i);
    }
    
    return  msgSend;
}


function getMusic() {
    return "Charlie Brown Jr. - " + getRandomMessage(arrMusics, musics);
}

const messageInterval = (sendMessage) => {

    function msgSend() {
        const msg = getRandomMessage(arrDelayed, delayedMessages)
        if(msg)
            sendMessage(msg);
    }

    msgSend();
    setInterval(msgSend, messagesInterval * (10 * MINUTO));
};





/**
 * 
 * @param {string} message 
 * @param {boolean} mentioned 
 */
const handleMessage = (message, author, mentioned) => {

    if(!message || !mentioned)
        return;

    const response = getRandomMessage(arrMentions, answersMention);
    if(response)
        return '🛹 ' + response.replaceAll('#author#', author);

    return;
}

module.exports = {
    handleMessage,
    log,
    messageInterval,
    getMusic
}