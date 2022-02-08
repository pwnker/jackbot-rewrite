const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, Permissions } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("lock")
    .setDescription("Lock the current channel."),

  async execute(interaction) {
    const modRole = await interaction.client.db.settings.findOne({
      attributes: ["value"],
      where: { name: "modRole", guild: interaction.guild.id },
    });

    if (
      !interaction.member.roles.cache.some(
        (role) => role.id === modRole.value
      ) ||
      !interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)
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

    embed = new MessageEmbed()
      .setTitle("Channel Locked")
      .setColor("RED")
      .setDescription(`This channel has been locked by a moderator.`);

    interaction.reply({ embeds: [embed] });
  },
};
