const Discord = require("discord.js")
const Schema = require("../../models/verifyToggle")

module.exports = {
	name: 'disableverify',
	description: 'Toggle switch to enable/disable the verification system. True to disable, false to enable',
	args: true,
	usage: "[true or false]",
    category: "Config",
	async execute (client, message, args) {
    	if(!message.member.roles.cache.find(role => role.name === "placeholder")) return;
		const statusChannel = client.channels.cache.get('887336979895816232');

		Schema.findOne({ guildID: message.guild.id }, async(err,data) => {
			if(data) data.delete();
			if(args[0] === "true"){
				new Schema({
					guildID: message.guild.id,
					disabled: true,
				}).save();
				message.reply("Successfully disabled the verification system. Members will no longer be automatically verified by the bot.")
				statusChannel.send(`Verification system was disabled by ${message.member}`)
			} else if (args[0] === "false"){
				new Schema({
					guildID: message.guild.id,
					disabled: false
				}).save();
				message.reply("Successfully enabled the verification system.")
				statusChannel.send(`Verification system was enabled by ${message.member}`)
			} else {
				message.reply("Not a valid choice. Valid choices are \`true\` or \`false\`")
			}

		})
	},
};