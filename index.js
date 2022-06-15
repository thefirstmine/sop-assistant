require('dotenv').config()

const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => res.send('Hello World!'));

app.listen(port, () => console.log(`SOP Assistant is now listening at http://localhost:${port}`));

const Discord = require("discord.js");
const fs = require("fs")
const { prefix } = require('./config.json')
const client = new Discord.Client({ 
      intents: ['GUILDS' , 'GUILD_MESSAGES', 'GUILD_PRESENCES', 'GUILD_BANS', 'GUILD_VOICE_STATES', 'GUILD_MEMBERS', 'DIRECT_MESSAGES'],
      partials: ['CHANNEL']
   });

// Custom Prefix handler
const prefixSchema = require('./models/prefix')

// Error handling
const errorWebhook = new Discord.WebhookClient({url: `${process.env.ERROR_WEBHOOK_URL}`})

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', reason.stack || reason)
  errorWebhook.send({
    content: `Unhandled Rejection at:\`\`\`\n${reason.stack || reason}\`\`\``,
    username: `${client.user.username} | Error logging`,
    avatarURL: `${client.user.avatarURL({size: 1024})}`,
    split: true
  })
})
process.on('uncaughtException', (err, origin) => {
  console.log(err, origin)
  errorWebhook.send({
    content: `Uncaught Exception at:\`\`\`\n${err}\n${origin}\`\`\``,
    username: `${client.user.username} | Error logging`,
    avatarURL: `${client.user.avatarURL({size: 1024})}`,
    split: true
  })
})

// Distube Initialization
const Distube = require('distube')
const { SoundCloudPlugin } = require('@distube/soundcloud')
const { SpotifyPlugin } = require('@distube/spotify')
client.distube = new Distube.default(client, {
  youtubeCookie: process.env.COOKIE,
  searchSongs: 1,
	searchCooldown: 10,
	leaveOnEmpty: true,
	emptyCooldown: 10,
	leaveOnFinish: true,
	leaveOnStop: true,
	plugins: [new SoundCloudPlugin(), new SpotifyPlugin({
    emitEventsAfterFetching: true,
  })],
})

const status = queue =>
  `Volume: \`${queue.volume}%\` | Filter: \`${queue.filters.join(', ')
  || 'Off'}\` | Loop: \`${queue.repeatMode
    ? queue.repeatMode === 2
      ? 'All Queue'
      : 'This Song'
    : 'Off'
  }\``

const eventEmbed = new Discord.MessageEmbed()
.setColor("#FCBA03")

client.distube.on('playSong', (queue, song) => {
  eventEmbed.setDescription(`Playing \`${song.name}\` - \`${song.formattedDuration}\`\nRequested by: ${song.user}\n${status(queue)}`)
  queue.textChannel.send({embeds: [eventEmbed]})
  }).on('addSong', (queue, song) => {
    eventEmbed.setDescription(`Added ${song.name} - \`${song.formattedDuration}\` to the queue by ${song.user}`)
    queue.textChannel.send({embeds: [eventEmbed]})
  })
  .on('addList', (queue, playlist) => {
    eventEmbed.setDescription(`Added \`${playlist.name}\` playlist (${playlist.songs.length} songs) to queue\n${status(queue)}`)
    queue.textChannel.send({embeds: [eventEmbed]})
  })
  /*.on('searchResult', (message, result) => {
    let i = 0
    message.channel.send(
      `**Choose an option from below**\n${result
        .map(
          song =>
            `**${++i}**. ${song.name} - \`${song.formattedDuration
            }\``,
        )
        .join(
          '\n',
        )}\n*Enter anything else or wait 30 seconds to cancel*`,
    )
  })
  .on('searchCancel', message => message.channel.send(`Searching canceled`))
  .on('searchInvalidAnswer', message =>
    message.channel.send(`searchInvalidAnswer`))
  .on('searchNoResult', message => message.channel.send(`No result found!`))*/
  .on('error', (textChannel, e) => {
    console.error(e)
    textChannel.send({content: `An error has occured! \`\`\`${e}\`\`\``, split: true})
  })

// Mongoose initialization
const mongoose = require('mongoose')
mongoose.connect(process.env.MONGODB,{
  useUnifiedTopology: true,
  useNewUrlParser: true
}).then(console.log("Connected to MongoDB!"))
  .catch(console.error())

// Modlogs embed structure
const modlogsSchema = require('./models/modlogs')
client.modlogs = async function({ Member, Action, Color, Reason, Moderator, Count, excChannel }, message) {
  const data = await modlogsSchema.findOne({ Guild: message.guild.id });
  if (!data) return;
  
  const channel = message.guild.channels.cache.get(data.Channel);
  const logsEmbed = new Discord.MessageEmbed()
  .setTitle(Action)
  .setColor(Color)
  .setDescription(`Reason: ${Reason || 'No reason was provided!'}`)
  .addField("Moderator:", Moderator)

  if (Member) logsEmbed.addField("Member that was tooked action on", `${Member.user.tag} (${Member.id})`)
  if (Count) logsEmbed.addField("Count of messages that was deleted", Count.toString()) // Count
  if (excChannel) logsEmbed.addField("Channel where it was executed", excChannel.toString()) //excChannel

  channel.send({embeds: [logsEmbed]})
}

// Command Handler
const { glob } = require('glob')
const { promisify } = require('util')
const globPromise = promisify(glob)

client.commands = new Discord.Collection();
client.slashCommands = new Discord.Collection();

const commandFolders = fs.readdirSync('./commands');

for (const folder of commandFolders) {
	const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const command = require(`./commands/${folder}/${file}`);
		client.commands.set(command.name, command);
	}
}

client.on('ready', async () => {
  const slashFolders = await globPromise(`${process.cwd()}/SlashCommands/*/*.js`);
  
  const arrayOfSlashCommands = [];
  
  slashFolders.map((value) => {
    const file = require(value);
    if(!file?.name) return;
    
    client.slashCommands.set(file.name, file);
    arrayOfSlashCommands.push(file)
  });
     await client.application?.commands.set(arrayOfSlashCommands) //for use for global use (1 hour caching process)
  
    //await client.guilds.cache.get('560339741602480128').commands.set(arrayOfSlashCommands) //UNCOMMENT IF TESTING FOR DEVELOPMENT
    //await client.guilds.cache.get('856412585862496266').commands.set(arrayOfSlashCommands)

    client.user.setActivity('s!help | discord.gg/ng535eZNje', { type: 'LISTENING' });
    errorWebhook.send({
      content: `**${client.user.username}** is now up and running.`,
      username: `${client.user.username} | Startup`,
      avatarURL: `${client.user.avatarURL({size: 1024})}`,
      split: true
    })
    console.log(`Logged in as ${client.user.tag}!`);
  });

client.on('guildMemberAdd', async member => {
  const { MessageActionRow, MessageSelectMenu, MessageButton } = require('discord.js');
  const verifyChannel = client.channels.cache.get("758966976365199371")
  const verifySchema = require("./models/verifyToggle");
  const data = await verifySchema.findOne({ guildID: member.guild.id });

  if(data.disabled) {
    verifyChannel.send(`Welcome to Scholars of Pisay, ${member}! Unfortunately, we have disabled verification for now. Please contact staff if you want to gain access to the server in <#852417681536974859>. I will also ping <@&923579881177108490> to notify them.`)
  } else {
    const arrayOfCampuses = ["BRC", "CARC", "CBZRC", "CLC", "CMC", "CRC", "CVC", "CVisC", "EVC", "IRC", "SMC", "SRC", "MRC", "MC", "WVC", "ZRC"]
    const arrayOfBatches = ["Batch 2022", "Batch 2023", "Batch 2024", "Batch 2025", "Batch 2026", "Batch 2027", "Graduated Alumnus"]

    verifyChannel.send(`Welcome to Scholars of Pisay, ${member}! Please read the DM I sent you to access the server. You have 30 minutes, else contact a staff member to assist you.`)

    const embed1 = new Discord.MessageEmbed()
    .setTitle("Campus Assignment! Choose your campus from the select menu below.")
    .setColor("#a83232")

    const embed2 = new Discord.MessageEmbed()
    .setTitle("Great! I got your campus, now choose what batch you are in from the select menu below.")
    .setColor("#a83232")

    const embed3 = new Discord.MessageEmbed()
    .setTitle("Finally, click the checkmark below to complete your verification.")
    .setColor("#a83232")

    let roles = [];

    const reformattedCampus = arrayOfCampuses.map(x => ({label: x, description: x, value: x}))
    const reformattedBatch = arrayOfBatches.map(x => ({label: x, description: x, value: x}))

    const interactionFilter = (interaction) => interaction.user.id === member.id;
    
    const campusRow = new MessageActionRow()
        .addComponents(
            new MessageSelectMenu()
                .setCustomId('campuses')
                .setPlaceholder("Choose a campus here!")
                .addOptions(reformattedCampus)
        )

    const batchRow = new MessageActionRow()
        .addComponents(
            new MessageSelectMenu()
                .setCustomId('batches')
                .setPlaceholder("Choose your batch here!")
                .addOptions(reformattedBatch)
        )
    
    const finalRow = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('check')
                .setLabel('✅')
                .setStyle('SUCCESS')
        )

    const findRole = (name) => {
        return member.guild.roles.cache.find(role => role.name === name)
    }

    try {
      const campusVerify = await member.user.send({embeds: [embed1], components: [campusRow]})
    //actual time 1800000
    const collector = campusVerify.createMessageComponentCollector({interactionFilter, time:1800000})
    collector.on("collect", async component => {
        await component.deferUpdate()
        campusVerify.delete()
        roles.push(component.values[0])
        member.user.send({content: `You clicked \`${component.values[0]}\`.`})
    })
    collector.on("end", async component => {
        if(!component.size) return member.user.send("Timed out, run `s!verify` in <#852417681536974859> to reverify!")

        const batchVerify = await member.user.send({embeds: [embed2], components: [batchRow]})

        const batchCollector = batchVerify.createMessageComponentCollector({interactionFilter, time:1800000})

        batchCollector.on("collect", async batch => {
            await batch.deferUpdate()
            batchVerify.delete()
            roles.push(batch.values[0])
            member.user.send({content: `You clicked \`${batch.values[0]}\`.`})
        })

        batchCollector.on("end", async batch => {
            if(!batch.size) return member.user.send("Timed out, run `s!verify` in <#852417681536974859> to reverify!")

            const finalVerify = await member.user.send({embeds: [embed3], components: [finalRow]})

            const finalCollector = finalVerify.createMessageComponentCollector({interactionFilter, time:1800000})

            finalCollector.on("collect", async final => {
                await final.deferUpdate()
                finalVerify.delete()

                member.roles.add(findRole(roles[0]))
                member.roles.add(findRole(roles[1]))
                member.roles.add(findRole("Pisay Verified"))
                member.roles.add(findRole("Server Verified"))
                member.roles.add(findRole("<~~~~~~~Color Roles~~~~~~~~>"))
                member.roles.add(findRole("<~~~~~~~~~School Roles~~~~~~~~~>"))
                member.roles.add(findRole("<~~~~~~~~~Leveled Roles~~~~~~~~~>"))
                member.roles.add(findRole("<~~~~Miscellaneous Roles~~~~>"))
                member.roles.remove(findRole("Unverified"))

                const logger = client.channels.cache.get("887336979895816232")
                logger.send(`User \`${member.user.username} (${member.user.id})\` verified succesfully with:\nCampus: \`${roles[0]}\`\nBatch: \`${roles[1]}\``)
                member.user.send("Verification completed, welcome to Scholars of Pisay! You can now chat in <#755070937371508827>.")
            })

            finalCollector.on("end", async final => {
                if(!final.size) return member.user.send("Timed out, run `s!verify` in <#852417681536974859> to reverify!")
            })
        })

    })
  } catch {
    verifyChannel.send(`${member}, seems like I can't DM you! Please run \`q!verify\` in <#852417681536974859> to reverify.`)
  }
}
})

client.on('interactionCreate', async interaction => {
  if(interaction.isCommand()) {
    await interaction.deferReply().catch( () => {} );

    const cmd = client.slashCommands.get(interaction.commandName);
    if(!cmd) return interaction.followUp({content: 'An error has occured'});

    const args = [];
    interaction.options.data.map((x) => {
      args.push(x.value);
    })
    cmd.run(client, interaction, args);
  }
})

client.on('messageCreate', async message => {

  if (message.author.bot || message.channel.type === 'dm') return;

  const fetchprefix = "s!"
  client.prefix = fetchprefix

  const prefixRegex = new RegExp(
    `^(${prefix}|${fetchprefix})\\s*`
  );
  
  if (prefixRegex.test(message.content)){
  
    const [, matchedPrefix] = message.content.match(prefixRegex);

    const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName)
      || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    if(command.ownerOnly && message.member.id !== process.env.OWNER_ID) return;

    if (command.voiceOnly && !message.member.voice.channel) {
      let reply = "You need to be in a voice channel to execute this!"
      message.reply({content: `${reply}`})
    } else if (command.voiceOnly && !message.member.voice.channel.joinable) {
      message.reply("I can't join this voice channel!")
    }

    if (command.args && !args.length) {
      let reply = `You didn't provide any arguments, ${message.author}!`;
    
      if (command.usage) {
        reply += `\nThe proper usage would be: \`${fetchprefix}${command.name} ${command.usage}\``;
      }
    
      return message.channel.send(reply);
    }

    try {
      command.execute(client, message, args);
    } catch (error) {
      console.error(error);
      message.reply('There was an error trying to execute that command!');
    }
}

})
client.login(process.env.TOKEN)
