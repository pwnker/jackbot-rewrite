const { SlashCommandBuilder, Embed } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warn a discord user.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to warn.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for warning the user.')
                .setRequired(true)),
    
    async execute(interaction) {
        if (!interaction.member.roles.cache.some(role => role.id === process.env.MOD_ROLE)) {
			return interaction.reply({content:'You do not have permission to use this command.',  ephemeral: true });
		}
        user = interaction.options.getUser('user');
        member = await interaction.guild.members.fetch(user);
        reason = interaction.options.getString('reason') || "No Reason";

        if (user.roles && user.roles.cache.some(role => role.id === process.env.MOD_ROLE)) {
            return interaction.reply({content:'You cannot warn a moderator.',  ephemeral: true });
        }

        embed = new MessageEmbed()
            .setColor("RED")
            .setTitle("Discord User Warned")
            .setThumbnail(user.displayAvatarURL({dynamic: true}))
            .setFooter({text:`Warned by ${interaction.user.username} | ${interaction.user.id}`})
            .addFields(
                { name: 'Username', value: `<@${user.id}>`, inline: true },
                { name: 'Reason', value: reason, inline: true },
            )
            .setTimestamp()
        
        await interaction.client.channels.cache.get(process.env.LOG_CHANNEL).send({ embeds: [embed]} ).catch(err => { });
        
        dmEmbed = new MessageEmbed()
            .setColor("RED")
            .setTitle("Warned")
            .setDescription(`You have been warned in ${interaction.guild.name}. Please read the rules and be respectful.`)
            .setTimestamp()
            .addFields(
                { name: 'Reason', value: reason, inline: true },
            )
            .setThumbnail(`${interaction.guild.iconURL({dynamic: true})}`)

        await member.send({ embeds: [dmEmbed]} ).catch(err => { });
        await interaction.reply({content:`<@${user.id}> has been warned.`,  ephemeral: true });

    }
};