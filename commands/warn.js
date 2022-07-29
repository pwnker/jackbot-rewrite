const { SlashCommandBuilder, Embed } = require("discord.js");
const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Warn a discord user.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to warn.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Reason for warning the user.")
        .setRequired(true)
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
      !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator) && interaction.member.id != 557106447771500545n
    ) {
      return interaction.reply({
        content: "You do not have permission to use this command.",
        ephemeral: true,
      });
    }
    user = interaction.options.getUser("user");
    member = await interaction.guild.members.fetch(user);
    reason = interaction.options.getString("reason") || "No Reason";

    if (
      (member.roles &&
        member.roles.cache.some((role) => role.id === modRole?.value)) ||
      member.permissions.has(PermissionsBitField.Flags.Administrator)
    ) {
      return interaction.reply({
        content: "You cannot warn a moderator.",
        ephemeral: true,
      });
    }

    confirmation = new EmbedBuilder()
      .setColor("Red")
      .setTitle("User Warned")
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setFooter({
        text: `Warned by ${interaction.user.username} | ${interaction.user.id}`,
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
      .setColor("Red")
      .setTitle("Warned")
      .setDescription(
        `You have been warned in ${interaction.guild.name}. Please read the rules and be respectful.`
      )
      .setTimestamp()
      .addFields({ name: "Reason", value: reason, inline: true })
      .setThumbnail(`${interaction.guild.iconURL({ dynamic: true })}`);

    await member.send({ embeds: [dmEmbed] }).catch((err) => { });
    await interaction.reply({
      content: `<@${user.id}> has been warned.`,
      ephemeral: true,
    });
  },
};
