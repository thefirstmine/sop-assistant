const Discord = require("discord.js")

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
        const { MessageActionRow, MessageSelectMenu, MessageButton } = require('discord.js');
        const verifyChannel = client.channels.cache.get("758966976365199371")
        const verifySchema = require("../../models/verifyToggle");
        const data = await verifySchema.findOne({ guildID: message.guild.id });
      
        if(data.disabled) {
          message.reply(`Welcome to Quarantined Pisaynons, ${message.member}! Unfortunately, we have disabled verification for now. Please contact staff if you want to gain access to the server in <#852417681536974859>. I will also ping <@&923579881177108490> to notify them.`)
        } else {
            const arrayOfCampuses = ["BRC", "CARC", "CBZRC", "CLC", "CMC", "CRC", "CVC", "CVisC", "EVC", "IRC", "SMC", "SRC", "MRC", "MC", "WVC", "ZRC"]
            const arrayOfBatches = ["Batch 2022", "Batch 2023", "Batch 2024", "Batch 2025", "Batch 2026", "Batch 2027", "Graduated Alumnus"]

            if(message.member.roles.cache.find(role => role.name === "Pisay Verified"))return message.reply("Seems like you're already verified!")

            message.reply("Please read the DM I sent you.")
            try {
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
            
                const interactionFilter = (interaction) => interaction.user.id === message.member.id;
                
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
                    return message.member.guild.roles.cache.find(role => role.name === name)
                }
            
                const campusVerify = await message.member.user.send({embeds: [embed1], components: [campusRow]})
                //actual time 1800000
                const collector = campusVerify.createMessageComponentCollector({interactionFilter, time:1800000})
                collector.on("collect", async component => {
                    await component.deferUpdate()
                    campusVerify.delete()
                    roles.push(component.values[0])
                    message.member.user.send({content: `You clicked \`${component.values[0]}\`.`})
                })
                collector.on("end", async component => {
                    if(!component.size) return message.member.user.send("Timed out.")
            
                    const batchVerify = await message.member.user.send({embeds: [embed2], components: [batchRow]})
            
                    const batchCollector = batchVerify.createMessageComponentCollector({interactionFilter, time:1800000})
            
                    batchCollector.on("collect", async batch => {
                        await batch.deferUpdate()
                        batchVerify.delete()
                        roles.push(batch.values[0])
                        message.member.user.send({content: `You clicked \`${batch.values[0]}\`.`})
                    })
            
                    batchCollector.on("end", async batch => {
                        if(!batch.size) return message.member.user.send("Timed out.")
            
                        const finalVerify = await message.member.user.send({embeds: [embed3], components: [finalRow]})
            
                        const finalCollector = finalVerify.createMessageComponentCollector({interactionFilter, time:1800000})
            
                        finalCollector.on("collect", async final => {
                            await final.deferUpdate()
                            finalVerify.delete()
            
                            message.member.roles.add(findRole(roles[0]))
                            message.member.roles.add(findRole(roles[1]))
                            message.member.roles.add(findRole("Pisay Verified"))
                            message.member.roles.add(findRole("Server Verified"))
                            message.member.roles.add(findRole("<~~~~~~~Color Roles~~~~~~~~>"))
                            message.member.roles.add(findRole("<~~~~~~~~~School Roles~~~~~~~~~>"))
                            message.member.roles.add(findRole("<~~~~~~~~~Leveled Roles~~~~~~~~~>"))
                            message.member.roles.add(findRole("<~~~~Miscellaneous Roles~~~~>"))
                            message.member.roles.remove(findRole("Unverified"))
            
                            const logger = client.channels.cache.get("887336979895816232")
                            logger.send(`User \`${message.member.user.username} (${message.member.user.id})\` verified succesfully with:\nCampus: \`${roles[0]}\`\nBatch: \`${roles[1]}\``)
                            message.member.user.send("Verification completed, welcome to Quarantined Pisaynons!")
                        })
            
                        finalCollector.on("end", async final => {
                            if(!final.size) return message.member.user.send("Timed out.")
                        })
                    })
            
                })
        } catch {
            message.channel.send(`${message.member}, seems like I can't DM you!`)
        }
}
      
	},
};
