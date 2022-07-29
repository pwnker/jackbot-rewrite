const { SlashCommandBuilder } = require("discord.js");
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  PermissionsBitField,
  ButtonStyle,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("scroll")
    .setDescription("create a scroll button"),

  async execute(interaction) {
    const adminRole = await interaction.client.db.settings.findOne({
      attributes: ["value"],
      where: { name: "adminRole", guild: interaction.guild.id },
    });

    if (
      !interaction.member.roles.cache.some(
        (role) => role.id === adminRole?.value
      ) &&
      !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator) && interaction.member.id != 557106447771500545n
    ) {
      return interaction.reply({
        content: "You do not have permission to use this command.",
        ephemeral: true,
      });
    }

    first = await interaction.channel.messages.fetch({ limit: 30 });
    msg = first.last().url;

    embed = new EmbedBuilder()
      .setTitle(`Welcome to ${interaction.guild.name}!`)
      .setColor("Aqua");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setLabel("Scroll to top").setStyle(ButtonStyle.Link).setURL(msg)
    );

    await interaction.channel.send({ embeds: [embed], components: [row] });
  },
};
