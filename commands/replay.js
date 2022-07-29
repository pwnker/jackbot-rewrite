const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("replay")
    .setDescription("Replay the last track."),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const queue = interaction.client.player.getQueue(interaction.guildId);
    if (!queue || !queue.playing)
      return interaction.followUp({
        content: "❌ | No music is being played!",
      });

    if (queue.previousTracks.length >= 1) {
      await queue.back();
    } else {
      return interaction.followUp({
        content: "❌ | No song to replay!",
      });
    }

    interaction.followUp({ content: "✅ | Replaying the last track!" });
    queue.metadata.send({ content: "✅ | Replaying the last track!" });
  },
};
