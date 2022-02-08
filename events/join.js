const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "guildMemberAdd",
  once: false,
  async execute(member) {
    const channel = await interaction.client.db.settings.findOne({
      attributes: ["value"],
      where: { name: "welcomeChannel", guild: interaction.guild.id },
    });

    embed = new MessageEmbed()
      .setTitle("Welcome to the server!")
      .setDescription(
        `Hey <@${member.id}>, welcome to ${interaction.guild.name}!`
      )
      .setTimestamp()
      .setFooter({ text: `Member #${member.guild.memberCount}` })
      .setThumbnail(member.displayAvatarURL({ dynamic: true }));

    if (channel) {
      await interaction.client.channels.cache
        .get(channel.value)
        .send({ embeds: [embed] });
    }
  },
};
