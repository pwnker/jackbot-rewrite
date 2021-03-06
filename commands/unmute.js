const { SlashCommandBuilder, Embed } = require("discord.js");
const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unmute")
    .setDescription("Unmute a user.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to unmute.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("reason").setDescription("Reason for unmuting the user.")
    ),

  async execute(interaction) {
    if (!interaction.guild) {
      return await interaction.reply({
        content: "You can only use this command in a server.",
        ephemeral: true,
      });
    }
    const modRole = await interaction.client.db.settings.findOne({
      attributes: ["value"],
      where: { name: "modRole", guild: interaction.guild.id },
    });

    if (
      !interaction.member.roles.cache.some(
        (role) => role.id === modRole?.value
      ) &&
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.Administrator
      ) &&
      interaction.member.id != 557106447771500545n
    ) {
      return interaction.reply({
        content: "You do not have permission to use this command.",
        ephemeral: true,
      });
    }
    user = interaction.options.getUser("user");
    member = await interaction.guild.members.fetch(user);
    reason = interaction.options.getString("reason") || "No Reason";

    if (!member.isCommunicationDisabled()) {
      return interaction.reply({
        content: `<@${member.id}> is not muted`,
        ephemeral: true,
      });
    }

    await member.timeout(null, reason);
    await interaction.reply({
      content: `Unmuted <@${user.id}>.`,
      ephemeral: true,
    });

    confirmation = new EmbedBuilder()
      .setColor("Aqua")
      .setTitle("User Unmuted")
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setFooter({
        text: `Unmuted by ${interaction.user.username} | ${interaction.user.id}`,
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

    dmEmbed = new EmbedBuilder()
      .setColor("Aqua")
      .setTitle("Unmuted")
      .setDescription(
        `You have been unmuted in ${interaction.guild.name}. You can now interact with the server again.`
      )
      .setTimestamp()
      .setThumbnail(`${interaction.guild.iconURL({ dynamic: true })}`);

    await member.send({ embeds: [dmEmbed] }).catch((err) => {});
  },
};
