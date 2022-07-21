

const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Pause the current song."),


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
      return interaction.reply({ content: "Music is already paused.", ephemeral: true });
    } else {

      queue.setPaused(true);
      queue.paused = true;
      return interaction.reply({ content: "⏸ | Music Paused!", ephemeral: false });

    }

  },
}