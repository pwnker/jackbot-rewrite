const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unlock')
		.setDescription('Unlock the current channel.'),

	async execute(interaction) {
        if (!interaction.member.roles.cache.some(role => role.id === process.env.MOD_ROLE)) {
			return interaction.reply({content:'You do not have permission to use this command.',  ephemeral: true });
		}

        interaction.channel.permissionOverwrites.edit(interaction.guild.id, {
            SEND_MESSAGES: null,
            ADD_REACTIONS: null,
        }
            )

            
        embed = new MessageEmbed()
            .setTitle("Channel Unlocked")
            .setColor('AQUA')
            .setDescription("This channel has been unlocked by a moderator.");

        interaction.reply({embeds: [embed]});
	},
};