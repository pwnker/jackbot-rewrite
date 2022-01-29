const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("lock")
    .setDescription("Lock the current channel."),

  async execute(interaction) {
    if (
      !interaction.member.roles.cache.some(
        (role) => role.id === process.env.MOD_ROLE
      )
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
