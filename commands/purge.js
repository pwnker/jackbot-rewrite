const { SlashCommandBuilder } = require("discord.js");
const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Purge up to 100 messages from the current channel.")
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("The amount of messages to purge.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("The reason for purging the messages.")
    )
    .addUserOption((option) =>
      option.setName("user").setDescription("The user to purge messages from.")
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

    amount = interaction.options.getInteger("amount");
    if (amount > 100 || amount < 1) {
      return interaction.reply({
        content: "You must enter a number between 1 and 100!",
        ephemeral: true,
      });
    }
    reason = interaction.options.getString("reason") || "No Reason";
    var messages = await interaction.channel.messages.fetch({ limit: amount });
    user = interaction.options.getUser("user");
    if (user) {
      var messages = messages.filter(
        (message) => message.author.id === user.id
      );
    }
    const purged = await interaction.channel.bulkDelete(messages, true);
    await interaction.reply({
      content: `Purged **${purged.size}** messages.`,
      ephemeral: true,
    });

    confirmation = new EmbedBuilder()
      .setColor("Red")
      .setTitle("Messages Purged")
      .setFooter({
        text: `Purged by ${interaction.user.username} | ${interaction.user.id}`,
      })
      .addFields(
        { name: "Amount", value: `${purged.size}`, inline: true },
        {
          name: "Username",
          value: user ? `<@${user.id}>` : `All users.`,
          inline: true,
        },
        { name: "Reason", value: reason, inline: true },
        { name: "Channel", value: `<#${interaction.channel.id}>`, inline: true }
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
