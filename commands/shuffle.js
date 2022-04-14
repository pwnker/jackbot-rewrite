const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("shuffle")
    .setDescription("Shuffle the queue."),

  async execute(interaction) {

    const queue = interaction.client.player.getQueue(interaction.guildId);
    if (!queue || !queue.playing)
      return interaction.reply({
        content: "❌ | No music is being played!",
      });

      await queue.shuffle();
    
      await interaction.reply({ content: "✅ | Queue shuffled!" });
  },
};
