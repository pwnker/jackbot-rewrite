const { SlashCommandBuilder, Embed } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unban")
    .setDescription("Unban a user from the server.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to unban.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("reason").setDescription("Reason for unbanning the user.")
    ),

  async execute(interaction) {
    if (
      !interaction.member.roles.cache.some(
        (role) => role.id === process.env.MOD_ROLE
      )
    ) {
      return interaction.reply({
        content: "You do not have permission to use this command.",
        ephemeral: true,
      });
    }
    user = interaction.options.getUser("user");
    reason = interaction.options.getString("reason") || "No Reason";

    await interaction.guild.bans.remove(user.id, reason).catch((err) => {});
    await interaction.reply({
      content: `Unbanned **${user.username}#${user.discriminator}**`,
      ephemeral: true,
    });

    embed = new MessageEmbed()
      .setColor("AQUA")
      .setTitle("Discord User Unanned")
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setFooter({
        text: `Unbanned by ${interaction.user.username} | ${interaction.user.id}`,
      })
      .addFields(
        { name: "Username", value: `<@${user.id}>`, inline: true },
        { name: "Reason", value: reason, inline: true }
      )
      .setTimestamp();

    await interaction.client.channels.cache
      .get(process.env.LOG_CHANNEL)
      .send({ embeds: [embed] })
      .catch((err) => {});
  },
};
