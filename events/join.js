const {MessageEmbed} = require('discord.js');

module.exports = {
	name: 'guildMemberAdd',
	once: false,
    async execute(member) {
		const channel = member.guild.channels.cache.get(process.env.WELCOME_CHANNEL);
        embed = new MessageEmbed()
            .setTitle("Welcome to the server!")
            .setDescription(`Hey <@${member.id}>, welcome to ${interaction.guild.name}!`)
            .setTimestamp()
            .setFooter({text:`Member #${member.guild.memberCount}`})
            .setThumbnail(member.displayAvatarURL({dynamic: true}))
        
        channel.send({ embeds: [embed] }).catch(err => { });
	}
    
};