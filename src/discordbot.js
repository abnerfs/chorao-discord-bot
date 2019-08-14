const { keys, prefix, music } = require('../config');
const Discord = require('discord.js');
const bot = new Discord.Client();
const ytdl = require('ytdl-core');
const ytSearch = require( 'yt-search' )

const { log, handleMessage, messageInterval, getMusic } = require('../src/controller');

const channels = [];

bot.login(keys.token )

//set path=%path%;C:\Program Files (x86)\Microsoft Visual Studio\2019\Community\MSBuild\Current\Bin


messageInterval(msgSend => {
    function handleError(ch, err) {
        log(err);
    }

    for (const channel of channels) {
        try {
            channel
                .send(msgSend)
                .catch(err => handleError(channel, err));
        }
        catch (err) {
            handleError(channel, err);
        }
    }

    channels.splice(0, channels.length);
})


let playStatus = {
    playing: false,
    channel: undefined,
    song: undefined,
    connection: undefined
}

const searchYT = search => {
    return new Promise((resolve, reject) => {
        ytSearch(search, function ( err, r ) {
            if ( err ) 
                reject(err);
           
            const videos = r.videos
            const playlists = r.playlists
            const accounts = r.accounts
           
            const firstResult = videos[0].url;
            
            resolve(firstResult);
            // console.log( firstResult )
        })
    });
   
}

const stopMusic = (message, authorMention) => {
    const guild = message.guild;

    if(playStatus && playStatus[guild.id] && playStatus[guild.id].connection && playStatus[guild.id].connection.dispatcher) {
        playStatus[guild.id].playing = false;
        playStatus[guild.id].connection.dispatcher.end();
        return message.channel.send(`Parei a música...`);
    }
    else {
        return message.channel.send(`Tem nada tocando `);
    }
}


const playMusic = async (message, authorMention) => {
    const guild = message.guild;

    const voiceChannel = message.member.voiceChannel;
    if (!voiceChannel) 
        return message.channel.send(`Você precisa ta em um canal de voz brother `);

    if(playStatus && playStatus[guild.id] && playStatus[guild.id].playing) 
        return message.channel.send(`Ja ta tocando música`);

      
    play(guild, message.channel, voiceChannel, authorMention, true);

}


const skipMusic = (message, authorMention) => {
    const guild = message.guild;
    
    if(playStatus && playStatus[guild.id] && playStatus[guild.id].connection && playStatus[guild.id].connection.dispatcher) {
        message.channel.send(`Próxima...`);
        playStatus[guild.id].connection.dispatcher.end();
        playStatus[guild.id].playing = false;
        play(guild, message.channel, playStatus[guild.id].voiceChannel, authorMention, true);
        return;
    }
    else {
        return message.channel.send(`Tem nada tocando `);
    }

}

const currentMusic = (message, authorMention) => {
    const guild = message.guild;


    if(playStatus && playStatus[guild.id] && playStatus[guild.id].connection && playStatus[guild.id].connection.dispatcher) {
        playingMsg(message.channel, playStatus[guild.id].song.title);
        return;
    }
    else {
        return message.channel.send(`Tem nada tocando `);
    }
}

const play = async (guild, channel, voiceChannel, authorMention, sendMsg) => {
    const connection = await voiceChannel.join();

    playStatus[guild.id] = {
        connection,
        voiceChannel,
        channel
    }

    const randomMusic = getMusic();

    let url = await searchYT(randomMusic);
    if(!url)
        return channel.send(`Tentei tocar ${randomMusic} mas não achei só cheirei.`);

    url = "https://www.youtube.com" + url;

    const songInfo = await ytdl.getInfo(url);
    const song = {
		title: songInfo.title,
		url: songInfo.video_url,
    };
    
    playStatus[guild.id].song = song;
    playStatus[guild.id].playing = true;

    if(sendMsg)
        playingMsg(channel, song.title);
    
	const dispatcher = connection.playStream( ytdl(url, { filter: 'audioonly' }))
        .on('end', () => {
            log('Music ended!');
            voiceChannel.leave();
            if(playStatus[guild.id].playing)
                play(guild, channel, voiceChannel, authorMention);
        })
        .on('error', error => {
            log(error);
        });

        dispatcher.setVolumeLogarithmic(1);

    return dispatcher;
}

function playingMsg(channel, title) {
    channel.send(`To tocando 🎵 ${title}`)
}



bot.on('ready', () => {
    bot.user.setStatus('dnd');
    bot.user.setActivity("🛹 Cheirando Skate", {
        type: "PLAYING"
    });
    log(`Logged in as ${bot.user.tag}!`);
});


bot.on('message', msg => {
    const author = msg.author;
    if (author.bot)
        return;

    const channel = msg.channel;
    let indexChannel = channels.findIndex(x => x.id === channel.id);
    if (indexChannel === -1) {
        channels.push(channel);
    }

    const message = msg.content;
    const isMentioned = msg.isMentioned(bot.user.id);

    const authorMention = `<@${author.id}>`;

    if(music) {
        if (message.startsWith(`${prefix}play`)) {
            playMusic(msg, authorMention);
            return;
        }
        else if(message.startsWith(`${prefix}stop`)) {
            stopMusic(msg, authorMention);
        }
        else if(message.startsWith(`${prefix}skip`)) {
            skipMusic(msg, authorMention);
        }
        else if (message.startsWith(`${prefix}np`) || message.startsWith(`${prefix}current`)) {
            currentMusic(msg, authorMention);
        }
    }

    const response = handleMessage(message, authorMention, isMentioned);
    if (response)
        msg.channel.send(response);

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