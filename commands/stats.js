const { SlashCommandBuilder } = require("discord.js");
const { EmbedBuilder, Formatters } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("stats")
        .setDescription("Display Jackbot's stats."),

    async execute(interaction) {
        client = interaction.client

        members = 0
        client.guilds.cache.forEach((guild) => { members += guild.memberCount })

        const embed = new EmbedBuilder()
            .setTitle("Jackbot Stats")
            .setColor("Aqua")
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: `Watching ${members} total members.` })
            .addFields(
                { name: "Servers", value: `${client.guilds.cache.size}`, inline: true },
                { name: "Uptime", value: `${Math.floor(client.uptime / 86400000)} Days`, inline: true },
            )

        interaction.reply({ embeds: [embed], ephemeral: true })
    }
}