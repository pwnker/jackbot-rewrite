const { SlashCommandBuilder } = require("discord.js");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("np")
    .setDescription("See what is currently playing in your voice channel."),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const queue = interaction.client.player.getQueue(interaction.guildId);
    if (!queue || !queue.playing)
      return interaction.followUp({
        content: "❌ | No music is being played!",
      });

    const progress = queue.createProgressBar();
    const perc = queue.getPlayerTimestamp();

    const embed = new EmbedBuilder()
      .setTitle("Now Playing")
      .setColor("Green")
      .setThumbnail(queue.current.thumbnail)
      .setDescription(
        `🎶 | **${queue.current.title}** by **${queue.current.author}** (\`${
          perc.progress == "Infinity" ? "Live" : perc.progress + "%"
        }\`)`
      )
      .addFields({
        name: "\u200b",
        value: progress.replace(/ 0:00/g, " ◉ LIVE"),
      });

    await interaction.followUp({ embeds: [embed] });
  },
};
