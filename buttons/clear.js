const { PermissionsBitField } = require("discord.js");
module.exports = {
  customId: "clear",
  async execute(interaction) {
    const queue = interaction.client.player.getQueue(interaction.guild.id);

    if (!interaction.member.voice.channel) {
      return interaction.reply({
        content: "You must be in a voice channel to skip a song.",
        ephemeral: true,
      });
    }

    if (!queue)
      return interaction.reply({
        content: "❌ | There are no songs in the queue.",
        ephemeral: true,
      });
    const modRole = await interaction.client.db.settings.findOne({
      attributes: ["value"],
      where: { name: "modRole", guild: interaction.guild.id },
    });

    if (
      interaction.member.voice.channel.members.size <= 2 ||
      interaction.member.roles.cache.some(
        (role) => role.id === modRole?.value
      ) ||
      interaction.member.permissions.has(
        PermissionsBitField.Flags.Administrator
      )
    ) {
      queue.clear();
      return interaction.reply({
        content: "✅ | The queue has been cleared.",
      });
    } else {
      return interaction.reply({
        content: "❌ | You do not have permission to clear the queue.",
        ephemeral: true,
      });
    }
  },
};
