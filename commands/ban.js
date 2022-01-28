// Ban a user from the server.

const { SlashCommandBuilder, Embed } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a user from the server.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to ban.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for banning the user.'))
        .addBooleanOption(option =>
            option.setName('purge')
                .setDescription('Purge the last 7 days of the user\'s messages.')),
    
    async execute(interaction) {
        if (!interaction.member.roles.cache.some(role => role.id === process.env.MOD_ROLE)) {
			return interaction.reply({content:'You do not have permission to use this command.',  ephemeral: true });
		}
        user = interaction.options.getUser('user');
        member = await interaction.guild.members.fetch(user);
        reason = interaction.options.getString('reason') || "No Reason";
        purge = interaction.options.getBoolean('purge');

        if (user.roles && user.roles.cache.some(role => role.id === process.env.MOD_ROLE)) {
            return interaction.reply({content:'You cannot ban a moderator.',  ephemeral: true });
        }

        dmEmbed = new MessageEmbed()
            .setColor("RED")
            .setTitle("Banned")
            .setDescription(`You have been banned from ${interaction.guild.name}.`)
            .setTimestamp()
            .addFields(
                { name: 'Reason', value: reason, inline: true },
            )
            .setThumbnail(`${interaction.guild.iconURL({dynamic: true})}`)
        await member.send({ embeds: [dmEmbed]} ).catch(err => { });

        if (purge) {
        await member.ban({reason: reason, days: 7}).catch(err => { })
        interaction.reply({content:`<@${user.id}> has been banned and their messages purged.`, ephemeral: true });  
        } else {
            await member.ban({reason: reason}).catch(err => { })
            interaction.reply({content:`<@${user.id}> has been banned.`, ephemeral: true });  
        }

        embed = new MessageEmbed()
            .setColor("RED")
            .setTitle("Discord User Banned")
            .setThumbnail(user.displayAvatarURL({dynamic: true}))
            .setFooter({text: `Banned by ${interaction.user.username} | ${interaction.user.id}`})
            .addFields(
                { name: 'Username', value: `<@${user.id}>`, inline: true },
                { name: 'Reason', value: reason, inline: true },
            )
            .setTimestamp()
        
        await interaction.client.channels.cache.get(process.env.LOG_CHANNEL).send({ embeds: [embed]} ).catch(err => { });

    }
};