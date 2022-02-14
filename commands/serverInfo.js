const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, Formatters } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("Get information about this server."),

  async execute(interaction) {
    if (!interaction.guild) {
      return await interaction.reply({
        content: "You can only use this command in a server.",
        ephemeral: true,
      });
    }
    const embed = new MessageEmbed()
      .setTitle(interaction.guild.name)
      .setColor("AQUA")
      .setThumbnail(interaction.guild.iconURL())
      .addFields(
        {
          name: "Owner",
          value: `<@${interaction.guild.ownerId}>`,
          inline: true,
        },
        {
          name: "Members",
          value: `${interaction.guild.memberCount}`,
          inline: true,
        },
        {
          name: "Channels",
          value: `${interaction.guild.channels.cache.size}`,
          inline: true,
        },
        {
          name: "Roles",
          value: `${interaction.guild.roles.cache.size}`,
          inline: true,
        },
        {
          name: "Emoji",
          value: `${interaction.guild.emojis.cache.size}`,
          inline: true,
        },
        {
          name: "Created",
          value: Formatters.time(interaction.guild.createdAt, "R"),
          inline: true,
        }
      )
      .setFooter({text: `ID: ${interaction.guild.id}`});

    await interaction.reply({ embeds: [embed] });
  },
};