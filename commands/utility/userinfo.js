const Discord = require("discord.js")

module.exports = {
	name: 'userinfo',
	description: 'Check info about a member!',
    usage: "[member]",
    category: "Utility",
	async execute (client, message, args) {
        let target;

        if(!args.length){
            target = message.guild.members.cache.get(message.author.id)
        } else if (message.mentions.users.size) {
            target = message.mentions.members.first();
        } else if (args[0].match(/^([0-9]{15,21})$/)) {
            target = message.guild.members.cache.get(args[0]);
        } else {
            target = message.guild.members.cache.find(x => x.user.username.toLowerCase() === args.join(' ').toLowerCase() ||
                x.user.tag.toLowerCase() === args.join(' ').toLowerCase());
        }
        if (!target) return message.reply("invalid user.")
        
        const userEmbed = new Discord.MessageEmbed()
        .setTitle("User info")
        .addField("Username and tag:", `${target.user.tag}`)
        .addField("User ID:", `${target.user.id}`)
        .addField("Joined this server at:", `${target.joinedAt}`)
        .addField("Joined Discord at:", `${target.user.createdAt}`)
        .addField("Roles:", `${target.roles.cache.map(role => role.name).join(' , ')}`)
        .setThumbnail(target.user.displayAvatarURL({dynamic: true}))
        .setColor("#FCBA03")

        message.channel.send({embeds: [userEmbed]})


	},
};