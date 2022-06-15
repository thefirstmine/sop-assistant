const Discord = require("discord.js")

module.exports = {
	name: '1984',
	description: 'Silence.',
    category: "Moderation",
	async execute(client, message, args) {
        if (!message.guild.me.permissions.has("MANAGE_MESSAGES")) return message.reply("I can't silence everyone! Contact your server admin to give me the `MANAGE_MESSAGES` permission.")
        if (!message.member.permissions.has("MANAGE_MESSAGES")) return message.reply("You can't 1984 the chat.")

        const fetched = await message.channel.messages.fetch({limit: 50})
        
        message.channel.bulkDelete(fetched)
        .catch(error => message.reply("there was an error trying to delete messages! Error: ```" + error + "```"))
        

        const confirmMessage = await message.channel.send({content: `Plan 1984 done.`})
        setTimeout(() => confirmMessage.delete(), 5000);
	},
};