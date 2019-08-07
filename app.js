const token = process.env.CHORAO_BOT_TOKEN || 'SECRET DO BOT QUE NAO VOU SUBIR NO GIT';

const Discord = require('discord.js');
const bot = new Discord.Client()

bot.login(token)


bot.on('ready', () => {
    console.log(`Logged in as ${bot.user.tag}!`);
  });
  
bot.on('message', msg => {
    const channel = msg.channel.id;
    const message = msg.content;
    const author = msg.author.id;

    if (message.substring(0, 1) == '!') {
        let args = message.substring(1).split(' ');

        const cmd = args[0];
        const steamid = args[1];
                
        args = args.splice(1);
        switch(cmd) {
            case 'chorao':
                msg.channel.send("Eai")
            break;
        }
    }
});


//joined a server
bot.on("guildCreate", guild => {
    console.log("Joined a new guild: " + guild.name);
})

//removed from a server
bot.on("guildDelete", guild => {
    console.log("Left a guild: " + guild.name);
})