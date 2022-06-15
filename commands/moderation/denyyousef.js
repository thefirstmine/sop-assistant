const Discord = require("discord.js")

module.exports = {
	name: 'denyyousef',
	description: 'deny yousef access to the channel youre in for the funny',
    category: "Moderation",
	async execute(client, message, args) {
        if(!message.member.roles.cache.find(role => role.name === "placeholder")) return;

        message.channel.permissionOverwrites.edit("593779248813047833", {
            SEND_MESSAGES: false
        })
        message.channel.send("<:qptrollge:888272051146719252>")
	},
};