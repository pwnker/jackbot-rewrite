const { SlashCommandBuilder, Embed } = require("@discordjs/builders");
const { MessageEmbed, Guild, Permissions } = require("discord.js");

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
      option
        .setName("reason")
        .setDescription("Reason for banning the user.")
        .setRequired(true)
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
    member = await interaction.guild.members.fetch(user);
    reason = interaction.options.getString("reason") || "No Reason";

    if (
      (user.roles &&
        user.roles.cache.some((role) => role.id === modRole?.value)) ||
      user.permissions.has(Permissions.FLAGS.ADMINISTRATOR)
    ) {
      return interaction.reply({
        content: "You cannot kick a moderator.",
        ephemeral: true,
      });
    }

    dmEmbed = new MessageEmbed()
      .setColor("RED")
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

    confirmation = new MessageEmbed()
      .setColor("RED")
      .setTitle("Discord User Kicked")
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
