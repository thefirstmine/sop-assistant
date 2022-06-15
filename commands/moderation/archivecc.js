const Discord = require("discord.js")

module.exports = {
	name: 'archivecc',
	description: 'Archive the custom channel.',
    category: "Moderation",
	async execute(client, message, args) {
        if(!message.member.roles.cache.find(role => role.name === "placeholder")) return message.reply("get placeholder first dumbass");
        if(message.channel.parent.id !== '760421382517161994') return message.reply("Why are you doing this outside the custom channels category?");

        message.channel.permissionOverwrites.edit(message.client.user, {
            SEND_MESSAGES: true,
            VIEW_CHANNEL: true
        })
        .then(message.channel.permissionOverwrites.edit(message.guild.roles.everyone.id, {
            SEND_MESSAGES: false,
        }))
        .then(message.channel.permissionOverwrites.edit(message.author.id, {
            SEND_MESSAGES: true,
        }))
        message.channel.send("Locked down this channel, moving to archives...")
        message.channel.setParent('761433936572055563', { lockPermissions: false })
        client.modlogs({
            Action: "A channel was archived!",
            excChannel: message.channel,
            Moderator: message.author.tag,
            Color: "RED"
        }, message)
        message.channel.send("Channel successfully archived.")
	},
};