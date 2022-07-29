const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  PermissionsBitField,
} = require("discord.js");

module.exports = {
  customId: "playPause",
  async execute(interaction) {
    if (!interaction.member.voice.channel) {
      return await interaction.reply({
        content: "You must be in a voice channel to use this button.",
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
      return await interaction.reply({
        content: "▶️ | Music Resumed!",
        ephemeral: false,
      });
    } else {
      queue.setPaused(true);
      queue.paused = true;
      return interaction.reply({
        content: "⏸ | Music Paused!",
        ephemeral: false,
      });
    }
  },
};
