const {
  MessageEmbed,
  MessageActionRow,
  MessageButton,
  Permissions,
} = require("discord.js");

module.exports = {
  customId: "skip",
  async execute(interaction) {
    if (!interaction.member.voice.channel) {
      return interaction.reply({
        content: "You must be in a voice channel to skip a song.",
        ephemeral: true,
      });
    }

    const queue = interaction.client.player.getQueue(interaction.guildId);
    if (queue.votes.includes(interaction.member.id)) {
      return interaction.reply({
        content: "You already voted to skip this song.",
        ephemeral: true,
      });
    }

    const modRole = await interaction.client.db.settings.findOne({
      attributes: ["value"],
      where: { name: "modRole", guild: interaction.guild.id },
    });

    if (
      interaction.member.voice.channel.members.size > 2 &&
      !interaction.member.roles.cache.some(
        (role) => role.id === modRole?.value
      ) &&
      !interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)
    ) {
      queue.votes.push(interaction.member.id);
      const row = new MessageActionRow().addComponents(
        new MessageButton()
          .setLabel("Vote to skip")
          .setStyle("SUCCESS")
          .setCustomId("skip")
          .setEmoji("⏭")
      );

      interaction.reply({
        content: `**${
          interaction.member.displayName
        }** has voted to skip the current song. **${
          queue.votes.length
        }/${Math.ceil(interaction.member.voice.channel.members.size / 2)}**.`,
        components: [row],
      });

      if (
        queue.votes.length >=
        Math.ceil(interaction.member.voice.channel.members.size / 2)
      ) {
        queue.skip();
        queue.votes = [];
        row = interaction.message.components[0]
      editedRow = row.components.forEach(button => {
          if (button.customId === "skip") {
            button.setDisabled(true);
          }
      });
      await interaction.message.edit({
          components: [row],});
        return interaction.followUp({
          content: `⏭ | Skipped the current song.`,
        });
      }
    } else {
      queue.skip();
      queue.votes = [];
      row = interaction.message.components[0]
      editedRow = row.components.forEach(button => {
          if (button.customId === "skip") {
            button.setDisabled(true);
          }
      });
      await interaction.message.edit({
          components: [row],});
      return interaction.reply({
        content: `⏭ | Skipped the current song.`,
      });
    }
  },
};
