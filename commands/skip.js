const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  PermissionsBitField,
  ButtonStyle,
} = require("discord.js");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skip the current song."),

  async execute(interaction) {
    if (!interaction.member.voice.channel) {
      return interaction.reply({
        content: "❌ | You must be in a voice channel to skip a song.",
        ephemeral: true,
      });
    }

    const queue = interaction.client.player.getQueue(interaction.guildId);

    if (!queue || !queue.playing) {
      return await interaction.reply({
        content: "❌ | No music is being played.",
        ephemeral: true,
      });
    }

    if (queue.votes.includes(interaction.member.id)) {
      return interaction.reply({
        content: "❌ | You already voted to skip this song.",
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
      !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)
    ) {
      queue.votes.push(interaction.member.id);
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("Vote to skip")
          .setStyle(ButtonStyle.Success)
          .setCustomId("skip")
          .setEmoji("⏭")
      );

      interaction.reply({
        content: `**${interaction.member.displayName
          }** has voted to skip the current song. **${queue.votes.length
          }/${Math.ceil(interaction.member.voice.channel.members.size / 2)}**.`,
        components: [row],
      });

      if (
        queue.votes.length >=
        Math.ceil(interaction.member.voice.channel.members.size / 2)
      ) {
        queue.skip();
        queue.votes = [];
        return interaction.followUp({
          content: `⏭ | Skipped the current song.`,
        });
      }
    } else {
      queue.skip();
      queue.votes = [];

      return interaction.reply({
        content: `⏭ | Skipped the current song.`,
      });
    }
  },
};
