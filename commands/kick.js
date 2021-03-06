const { SlashCommandBuilder, Embed } = require("discord.js");
const { EmbedBuilder, Guild, PermissionsBitField } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a user from the server.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to kick.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("reason").setDescription("Reason for kicking the user.")
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
    if (
      (member.roles &&
        member.roles.cache.some((role) => role.id === modRole?.value)) ||
      member.permissions.has(PermissionsBitField.Flags.Administrator)
    ) {
      return interaction.reply({
        content: "You cannot kick a moderator.",
        ephemeral: true,
      });
    }

    dmEmbed = new EmbedBuilder()
      .setColor("Red")
      .setTitle("Kicked")
      .setDescription(
        `You have been kicked from ${interaction.guild.name}. You can join back at any time however you should resolve the issue described in the kick reason to avoid further punishment.`
      )
      .setTimestamp()
      .setThumbnail(`${interaction.guild.iconURL({ dynamic: true })}`)
      .addFields({ name: "Reason", value: reason, inline: true });

    await member.send({ embeds: [dmEmbed] }).catch((err) => {});

    await member.kick({ reason: reason });
    await interaction.reply({
      content: `<@${user.id}> has been kicked.`,
      ephemeral: true,
    });

    confirmation = new EmbedBuilder()
      .setColor("Red")
      .setTitle("User Kicked")
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setFooter({
        text: `Kicked by ${interaction.user.username} | ${interaction.user.id}`,
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
