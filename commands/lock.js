const { SlashCommandBuilder } = require("discord.js");
const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("lock")
    .setDescription("Lock the current channel."),

  async execute(interaction) {
    if (!interaction.guild) {
      return await interaction.reply({
        content: "You can only use this command in a server.",
        ephemeral: true,
      });
    }
    const modRole = await interaction.client.db.settings.findOne({
      attributes: ["value"],
      where: { name: "modRole", guild: interaction.guild.id },
    });

    if (
      !interaction.member.roles.cache.some(
        (role) => role.id === modRole?.value
      ) &&
      !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)
    ) {
      return interaction.reply({
        content: "You do not have permission to use this command.",
        ephemeral: true,
      });
    }

    interaction.channel.permissionOverwrites.edit(interaction.guild.id, {
      SEND_MESSAGES: false,
      ADD_REACTIONS: false,
    });

    embed = new EmbedBuilder()
      .setTitle("Channel Locked")
      .setColor("Red")
      .setDescription(`This channel has been locked by a moderator.`);

    interaction.reply({ embeds: [embed] });
  },
};
