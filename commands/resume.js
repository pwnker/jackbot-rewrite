const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, Guild, Permissions } = require("discord.js");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("resume")
    .setDescription("Resume the paused song."),

  async execute(interaction) {
    if (!interaction.member.voice.channel) {
      return await interaction.reply({
        content: "You must be in a voice channel to use this command.",
        ephemeral: true,
      });
    }


    const queue = interaction.client.player.getQueue(interaction.guildId);
    if (!queue || !queue.playing) {
      return await interaction.reply({
        content: "No music is being played.",
        ephemeral: true,
      });
    }
    if (queue.paused) {
      queue.setPaused(false);
      queue.paused = false;
      return interaction.reply({ content: "▶️ | Music Resumed!", ephemeral: false });
    } else {
      return await interaction.reply({
        content: "Music is aleady playing.",
        ephemeral: true,
      });
    }
  },
};
