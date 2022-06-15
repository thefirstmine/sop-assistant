const Discord = require("discord.js")
const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
	name: 'say',
	description: 'make the bot say stuff',
    category: "Utility",
	execute(client, message, args) {
    if(!message.member.roles.cache.find(role => role.name === "placeholder")) return;
		const bastosanChannel = message.guild.channels.cache.get("755070937371508827")
        bastosanChannel.send(`${message.author.tag} says:\n${args.slice(0).join(' ')}`)
	},
};