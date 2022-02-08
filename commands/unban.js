const { SlashCommandBuilder, Embed } = require("@discordjs/builders");
const { MessageEmbed, Permissions } = require("discord.js");

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
    const modRole = await interaction.client.db.settings.findOne({
      attributes: ["value"],
      where: { name: "modRole", guild: interaction.guild.id },
    });

    if (
      !interaction.member.roles.cache.some(
        (role) => role.id === modRole?.value
      ) ||
      !interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)
    ) {
      return interaction.reply({
        content: "You do not have permission to use this command.",
        ephemeral: true,
      });
    }
    user = interaction.options.getUser("user");
    reason = interaction.options.getString("reason") || "No Reason";

    await interaction.guild.bans.remove(user.id, reason);
    await interaction.reply({
      content: `Unbanned **${user.username}#${user.discriminator}**`,
      ephemeral: true,
    });

    confirmation = new MessageEmbed()
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

      const logChannel = await interaction.client.db.settings.findOne({
        attributes: ["value"],
        where: { name: "logChannel", guild: interaction.guild.id },
      });
  
      if (logChannel) {
        await interaction.client.channels.cache
          .get(logChannel.value)
          .send({ embeds: [confirmation] });
      }
  },
};
