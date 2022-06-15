const Discord = require("discord.js")

module.exports = {
	name: 'bam',
	description: 'Ban a member.',
    args: true,
    usage: "[member] <reason>",
    category: "Moderation",
	async execute (client, message, args) {
    if(!message.member.roles.cache.find(role => role.name === "placeholder")) return;

        let target;
        if (message.mentions.users.size) {
            target = message.mentions.members.first();
        } else if (args[0].match(/^([0-9]{15,21})$/)) {
            target = message.guild.members.cache.get(args[0]);
        } else {
            target = message.guild.members.cache.find(x => x.user.username.toLowerCase() === args.join(' ').toLowerCase() ||
                x.user.tag.toLowerCase() === args.join(' ').toLowerCase());
        }
        if (!target) return message.reply("invalid user.")
        if (target === message.author) return message.reply("you can't ban yourself!")

        let reason2 = args.slice(1).join(' ')
        let reason = `Banned by ${message.author.tag} with reason "${args.slice(1).join(' ')}"`

        if(!reason2){ 
            reason = `Banned by ${message.author.tag} with no reason provided.`
        }

        message.channel.send(`Successfully banned ${target}.`)
	},
};