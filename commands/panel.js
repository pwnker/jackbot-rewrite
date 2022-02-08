const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, MessageActionRow, MessageButton, Permissions } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("panel")
    .setDescription("create a support pannel!")
    .addStringOption((option) =>
      option
        .setName("panel")
        .setDescription("The name of the panel.")
        .setRequired(true)
        .addChoice("Support Panel", "support")
        .addChoice("Button Role Panel", "roles")
    ),

  async execute(interaction) {
    const adminRole = await interaction.client.db.settings.findOne({
      attributes: ["value"],
      where: { name: "adminRole", guild: interaction.guild.id },
    });

    if (
      !interaction.member.roles.cache.some(
        (role) => role.id === adminRole.value
      ) ||
      !interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)
    ) {
      return interaction.reply({
        content: "You do not have permission to use this command.",
        ephemeral: true,
      });
    }
    panel = interaction.options.getString("panel");

    if (panel == "roles") {
      embed = new MessageEmbed()
        .setTitle("Notification Settings")
        .setColor("AQUA")
        .setDescription(
          "Toggle which type of notifications you would like to receive using the buttons below."
        )
        .addFields(
          {
            name: "Announcements",
            value: "Receive notifications for news about the server.",
            inline: true,
          },
          {
            name: "Events",
            value:
              "Receive notifications for events taking place on the server.",
            inline: true,
          }
        );

      row = new MessageActionRow().addComponents(
        new MessageButton()
          .setCustomId("alertRole")
          .setLabel("Announcements")
          .setStyle("PRIMARY"),
        new MessageButton()
          .setCustomId("eventRole")
          .setLabel("Events")
          .setStyle("PRIMARY")
      );
    }

    await interaction.channel.send({ embeds: [embed], components: [row] });
  },
};
