const Discord = require("discord.js")
const { MessageActionRow, MessageSelectMenu, MessageButton } = require('discord.js');

module.exports = {
	name: 'verify',
	description: 'Verify yourself.',
    category: "Miscellaneous",
    /**
     * 
     * @param {Discord.Client} client 
     * @param {Discord.Message} message 
     * @param {String[]} args 
     * @returns 
     */
	async execute (client, message, args) {
        const member = message.member

        if(member.roles.cache.find(role => role.name === "Iskolar ng Bayan")) return message.reply("You're already verified!")

        message.reply("Please check your DMs.")

        const arrayOfCampuses = ["BRC", "CARC", "CBZRC", "CLC", "CMC", "CRC", "CVC", "CVisC", "EVC", "IRC", "SMC", "SRC", "MRC", "Main Campus", "WVC", "ZRC"]
        const arrayOfBatches = ["2023", "2024", "2025", "2026", "2027","2028", "Alumni"]
          
        const embed1 = new Discord.MessageEmbed()
        .setTitle("Campus Assignment! Choose your campus from the select menu below.")
        .setColor("#a83232")
      
        const embed2 = new Discord.MessageEmbed()
        .setTitle("Great! I got your campus, now choose what batch you are in from the select menu below.")
        .setColor("#a83232")
      
        const embed3 = new Discord.MessageEmbed()
        .setTitle("Finally, send a a picture of KHub with your Discord client beside it. You can censor any information except for the URL and subjects. An example of the screenshot is shown here:")
        .setImage("https://media.discordapp.net/attachments/852417681536974859/943147943358242866/unknown.png")
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
          if(!component.size) return member.user.send("Timed out, run `s!verify` in <#987248965588250644> to reverify!")
      
          const batchVerify = await member.user.send({embeds: [embed2], components: [batchRow]})
      
          const batchCollector = batchVerify.createMessageComponentCollector({interactionFilter, time:1800000})
      
          batchCollector.on("collect", async batch => {
            await batch.deferUpdate()
            batchVerify.delete()
            roles.push(batch.values[0])
            member.user.send({content: `You clicked \`${batch.values[0]}\`.`})
          })
      
          batchCollector.on("end", async batch => {
            if(!batch.size) return member.user.send("Timed out, run `s!verify` in <#987248965588250644> to reverify!")
      
            const finalVerify = await member.user.send({embeds: [embed3]})
      
            const finalCollector = new Discord.MessageCollector(finalVerify.channel, {time:1800000, max: 1})
      
            finalCollector.on("collect", async final => {
              finalVerify.delete()
              
              let image;
              if (final.attachments.first()) {
                image = final.attachments.first().url
              } else { 
                const { find } = require("linkifyjs")
                const screenshot = final.content
                
                image = find(screenshot)[0].href
              }
              const yesNoRow = new MessageActionRow()
                .addComponents(
                  new MessageButton()
                    .setLabel("Yes") 
                    .setCustomId("yes " + member.user.id)
                    .setStyle("SUCCESS"),
                  new MessageButton()
                    .setLabel("No")
                    .setCustomId("no " + member.user.id)
                    .setStyle("DANGER")
                )
              const logger = client.channels.cache.get("983970380538601542")
              const verification = new Discord.MessageEmbed()
              .setTitle(`User ${member.user.tag} wants to verify:`)
              .setThumbnail(member.user.avatarURL({size: 1024}))
              .setColor("#a83232")
              .addField("Campus", roles[0])
              .addField("Batch", roles[1])
              .setImage(image)
              .setFooter({text: `User ID: ${member.user.id}`})
              logger.send({embeds: [verification], components: [yesNoRow]})
              
              member.user.send("Verification completed, a moderator will review your request, and you will be notified when your request has been approved or denied.")
            })
      
            finalCollector.on("end", async final => {
                if(!final.size) return member.user.send("Timed out, run `s!verify` in <#987248965588250644> to reverify!")
            })
          })
      
        })
        } catch {
          message.channel.send(`${member}, seems like I can't DM you! Please run \`s!verify\` in <#987248965588250644> to reverify.`)
        }
      
	},
};
