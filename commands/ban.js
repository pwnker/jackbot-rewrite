// Ban a user from the server.

const { SlashCommandBuilder, Embed } = require("@discordjs/builders");
const { MessageEmbed, Permissions } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban a user from the server.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to ban.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("reason").setDescription("Reason for banning the user.")
    )
    .addBooleanOption((option) =>
      option
        .setName("purge")
        .setDescription("Purge the last 7 days of the user's messages.")
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
      ) ||
      !interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)
    ) {
      return interaction.reply({
        content: "You do not have permission to use this command.",
        ephemeral: true,
      });
    }
    user = interaction.options.getUser("user");
    member = await interaction.guild.members.fetch(user);
    reason = interaction.options.getString("reason") || "No Reason";
    purge = interaction.options.getBoolean("purge");

    if (
      (member.roles &&
        member.roles.cache.some((role) => role.id === modRole?.value)) ||
        member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)
    ) {
      return interaction.reply({
        content: "You cannot ban a moderator.",
        ephemeral: true,
      });
    }

    dmEmbed = new MessageEmbed()
      .setColor("RED")
      .setTitle("Banned")
      .setDescription(`You have been banned from ${interaction.guild.name}.`)
      .setTimestamp()
      .addFields({ name: "Reason", value: reason, inline: true })
      .setThumbnail(`${interaction.guild.iconURL({ dynamic: true })}`);
    await member.send({ embeds: [dmEmbed] }).catch((err) => {});

    if (purge) {
      await member.ban({ reason: reason, days: 7 });
      interaction.reply({
        content: `<@${user.id}> has been banned and their messages purged.`,
        ephemeral: true,
      });
    } else {
      await member.ban({ reason: reason });
      interaction.reply({
        content: `<@${user.id}> has been banned.`,
        ephemeral: true,
      });
    }

    confirmation = new MessageEmbed()
      .setColor("RED")
      .setTitle("Discord User Banned")
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setFooter({
        text: `Banned by ${interaction.user.username} | ${interaction.user.id}`,
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
