const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, Permissions } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unlock")
    .setDescription("Unlock the current channel."),

  async execute(interaction) {
    const modRole = await interaction.client.db.settings.findOne({
      attributes: ["value"],
      where: { name: "modRole", guild: interaction.guild.id },
    });

    if (
      !interaction.member.roles.cache.some(
        (role) => role.id === modRole?.value
      ) ||
      !interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)
    ) {
      return interaction.reply({
        content: "You do not have permission to use this command.",
        ephemeral: true,
      });
    }

    interaction.channel.permissionOverwrites.edit(interaction.guild.id, {
      SEND_MESSAGES: null,
      ADD_REACTIONS: null,
    });

    embed = new MessageEmbed()
      .setTitle("Channel Unlocked")
      .setColor("AQUA")
      .setDescription("This channel has been unlocked by a moderator.");

    interaction.reply({ embeds: [embed] });
  },
};
