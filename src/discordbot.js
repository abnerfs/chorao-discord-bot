const config = require('../config');
const Discord = require('discord.js');
const bot = new Discord.Client();

const { log, handleMessage, messageInterval, getMusic } = require('../src/controller');

const channels = [];

const token = process.env.CHORAO_BOT_TOKEN || config.keys.token || 'SECRET DO BOT QUE NAO VOU SUBIR NO GIT';

bot.login(token)


bot.on('ready', () => {
    bot.user.setStatus('dnd');
    bot.user.setActivity("Cheirando Skate", {
        type: "PLAYING"
    });
    log(`Logged in as ${bot.user.tag}!`);
});


messageInterval(msgSend => {
    function handleError(ch, err) {
        // let index = channels.indexOf(ch);
        // if(index > -1)
        //     channels.splice(index, 1);
        log(err);
    }

    for(const channel of channels) {
        try  {
            channel
                .send(msgSend)
                .catch(err => handleError(channel, err));

            // let index = channels.indexOf(channel);
            // if(index > -1)
            //     channels.splice(index, 0);
        }
        catch(err) {
            handleError(channel, err);
        }
    }

    channels.splice(0, channels.length);
})


  
bot.on('message', msg => {
    const author = msg.author;
    
    if(author.bot || author.id === bot.user.id)
        return;

    const channel = msg.channel;
    let indexChannel = channels.findIndex(x => x.id === channel.id);
    if(indexChannel === -1) {
        channels.push(channel);
    }

    const message = msg.content;
    const authorMention = `<@${author.id}>`;
    const isMentioned = msg.isMentioned(bot.user.id);
    
    if(isMentioned && message.indexOf("!toca") > -1) {
        msg.channel.send(`${getMusic()}`);
        return;
    }

    const response = handleMessage(message, authorMention, isMentioned);
    if(response)
        msg.channel.send(response);

    // if (message.substring(0, 1) == '!') {
    //     let args = message.substring(1).split(' ');

    //     const cmd = args[0];
    //     const steamid = args[1];
                
    //     args = args.splice(1);
    //     switch(cmd) {
    //         case 'chorao':
    //             msg.channel.send("Eai")
    //         break;
    //     }
    // }
});


//joined a server
bot.on("guildCreate", guild => {
    log("Joined a new guild: " + guild.name);
})

//removed from a server
bot.on("guildDelete", guild => {
    log("Left a guild: " + guild.name);
})

module.exports = bot;