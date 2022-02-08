const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "guildMemberAdd",
  once: false,
  async execute(member) {
    const channel = await member.client.db.settings.findOne({
      attributes: ["value"],
      where: { name: "welcomeChannel", guild: member.guild.id },
    });

    const joinRole = await member.client.db.settings.findOne({
      attributes: ["value"],
      where: { name: "joinRole", guild: member.guild.id },
    });

    if (joinRole) {
      await member.roles.add(joinRole.value);
    }

    embed = new MessageEmbed()
      .setTitle("Welcome to the server!")
      .setDescription(
        `Hey <@${member.id}>, welcome to **${member.guild.name}**!`
      )
      .setTimestamp()
      .setColor("AQUA")
      .setFooter({ text: `Member #${member.guild.memberCount}` })
      .setThumbnail(member.displayAvatarURL({ dynamic: true }));

    if (channel) {
      await member.client.channels.cache
        .get(channel.value)
        .send({ embeds: [embed] });
    }
  },
};
