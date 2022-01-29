const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

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
    if (
      !interaction.member.roles.cache.some(
        (role) => role.id === process.env.ADMIN_ROLE
      )
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
    await interaction.channel.bulkDelete(messages, true);
    await interaction.reply({
      content: `Purged **${amount}** messages.`,
      ephemeral: true,
    });

    confirmation = new MessageEmbed()
      .setColor("RED")
      .setTitle("Messages Purged")
      .setFooter({
        text: `Purged by ${interaction.user.username} | ${interaction.user.id}`,
      })
      .addFields(
        { name: "Amount", value: `${amount}`, inline: true },
        {
          name: "Username",
          value: user ? `<@${user.id}>` : `All users.`,
          inline: true,
        },
        { name: "Reason", value: reason, inline: true },
        { name: "Channel", value: `<#${interaction.channel.id}>`, inline: true }
      )
      .setTimestamp();

    await interaction.client.channels.cache
      .get(process.env.LOG_CHANNEL)
      .send({ embeds: [confirmation] });
  },
};
