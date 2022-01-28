const { SlashCommandBuilder } = require('@discordjs/builders');
const { channel } = require('diagnostics_channel');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('game')
		.setDescription('Play a game in a discord voice channel.')
		.addStringOption(option => 
			option.setName('game')
			.setDescription('The game you want to play.')
			.setRequired(true)
            .addChoice('Youtube', 'youtube')
            .addChoice('Poker', 'poker')
            .addChoice('Chess', 'chess')
            .addChoice('Checkers', 'checkers')
            .addChoice('Betrayal', 'betrayal')
            .addChoice('Fishington', 'fishing')
            .addChoice('Letter Tile', 'lettertile')
            .addChoice('Words Snack', 'wordsnack')
            .addChoice('Doodle Crew', 'doodlecrew')
            .addChoice('SpellCast', 'spellcast')
            .addChoice('Awkword', 'awkword')
            .addChoice('Putt Party', 'puttparty'))
        .addChannelOption(option => 
            option.setName('channel')
            .setDescription('The channel to play the game in.')
            .setRequired(true)),
	
        
	async execute(interaction) {
        const game = interaction.options.getString('game');
        const channel = interaction.options.getChannel('channel');
        if (channel.type == 'GUILD_VOICE') {
            interaction.client.discordTogether.createTogetherCode(channel.id, game).then(async invite => {
                return interaction.reply(`${invite.code} <--- Click this invite link to join!`).catch(err => { });
        });
            
        } else {
            interaction.reply({content: 'You must select a voice channel not a text channel.', ephemeral: true} );
        }
    }
    
};