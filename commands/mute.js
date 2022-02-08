const { SlashCommandBuilder, Embed } = require("@discordjs/builders");
const { MessageEmbed, Permissions } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Mute a user.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to mute.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("reason").setDescription("Reason for muting the user.")
    )
    .addStringOption((option) =>
      option
        .setName("duration")
        .setDescription("Duration of the mute. e.g. 1m, 1h, 1d")
    ),

  async execute(interaction) {
    const modRole = await interaction.client.db.settings.findOne({
      attributes: ["value"],
      where: { name: "modRole", guild: interaction.guild.id },
    });

    if (
      !interaction.member.roles.cache.some(
        (role) => role.id === modRole.value
      ) ||
      !interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)
    )  {
      return interaction.reply({
        content: "You do not have permission to use this command.",
        ephemeral: true,
      });
    }
    user = interaction.options.getUser("user");
    member = await interaction.guild.members.fetch(user);
    reason = interaction.options.getString("reason") || "No Reason";
    var duration = interaction.options.getString("duration") || "28d";

    if (
      (user.roles &&
        user.roles.cache.some((role) => role.id === modRole.value)) ||
      user.permissions.has(Permissions.FLAGS.ADMINISTRATOR)
    ) {
      return interaction.reply({
        content: "You cannot mute a moderator.",
        ephemeral: true,
      });
    }

    if (!duration.match(/^\d+[mhd]$/)) {
      return interaction.reply({
        content: "Invalid duration.",
        ephemeral: true,
      });
    }

    units = new Map();
    units.set("m", 60 * 1000);
    units.set("h", 60 * 60 * 1000);
    units.set("d", 24 * 60 * 60 * 1000);

    var time = parseInt(duration.replace(/[^0-9]/g, ""));
    var multiplyer = units.get(duration.replace(/[0-9]/g, ""));

    await member.timeout(time * multiplyer, reason)
    await interaction.reply({
      content: `<@${user.id}> has been muted for ${duration}`,
      ephemeral: true,
    });

    embed = new MessageEmbed()
      .setColor("RED")
      .setTitle("Discord User Muted")
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setFooter({
        text: `Muted by ${interaction.user.username} | ${interaction.user.id}`,
      })
      .addFields(
        { name: "Username", value: `<@${user.id}>`, inline: true },
        { name: "Reason", value: reason, inline: true },
        { name: "Duration", value: `${duration}`, inline: true }
      )
      .setTimestamp();

    await interaction.client.channels.cache
      .get(process.env.LOG_CHANNEL)
      .send({ embeds: [embed] })

    dmEmbed = new MessageEmbed()
      .setColor("RED")
      .setTitle("Muted")
      .setDescription(`You have been muted in ${interaction.guild.name}.`)
      .addFields({ name: "Reason", value: reason, inline: true })
      .setTimestamp()
      .setThumbnail(`${interaction.guild.iconURL({ dynamic: true })}`);

    await member.send({ embeds: [dmEmbed] }).catch((err) => {});
  },
};
