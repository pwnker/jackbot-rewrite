const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("scroll")
    .setDescription("create a scroll button"),

  async execute(interaction) {
    if (
      !interaction.member.roles.cache.some(
        (role) => role.id === process.env.ADMIN_ROLE
      )
    ) {
      return interaction.reply({
        content: "You do not have permission to use this command.",
        ephemeral: true,
      });
    }

    first = await interaction.channel.messages.fetch({ limit: 30 });
    msg = first.last().url;

    embed = new MessageEmbed()
      .setTitle(`Welcome to ${interaction.guild.name}!`)
      .setColor("AQUA");

    const row = new MessageActionRow().addComponents(
      new MessageButton().setLabel("Scroll to top").setStyle("LINK").setURL(msg)
    );

    await interaction.channel.send({ embeds: [embed], components: [row] });
  },
};
