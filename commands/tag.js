const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, Permissions } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("tag")
    .setDescription("Fetch or create a tag.")
    .addSubcommand((subcommand) =>
      subcommand.setName("list").setDescription("List all tags.")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("send")
        .setDescription("Send a tag to the current channel.")
        .addStringOption((option) =>
          option
            .setName("name")
            .setAutocomplete(true)
            .setDescription("The name of the tag.")
            .setRequired(true)
        )
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("The user to direct the tag to.")
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("create")
        .setDescription("Create a tag")
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription("The name of the tag.")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("content")
            .setDescription("The content of the tag to add.")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("edit")
        .setDescription("Edit a tag")
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription("The name of the tag.")
            .setAutocomplete(true)
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("content")
            .setDescription("The new content for the tag.")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Remove a tag")
        .addStringOption((option) =>
          option
            .setName("name")
            .setAutocomplete(true)
            .setDescription("The name of the tag.")
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    const name = interaction.options.getString("name");
    const content = interaction.options.getString("content");
    const target = interaction.options.getUser("user");

    if (interaction.options.getSubcommand() == "list") {
      const tags = await interaction.client.db.tags.findAll({
        attributes: ["name"],
        where: {
          guild: interaction.guild.id,
        },
      });
      string = tags.map((t) => t.name).join(", ") || "No tags set.";
      const embed = new MessageEmbed()
        .setColor("AQUA")
        .setTitle("Tags")
        .setDescription(`${string}`)
        .setFooter({ text: "Use /tag view <tag> to view a tag." });
      return await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (interaction.options.getSubcommand() == "create") {
      const modRole = await interaction.client.db.settings.findOne({
        attributes: ["value"],
        where: { name: "modRole", guild: interaction.guild.id },
      });
  
      if (
        !interaction.member.roles.cache.some(
          (role) => role.id === modRole.value
        ) ||
        !interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)
      ) {
        return interaction.reply({
          content: "You do not have permission to create a tag.",
          ephemeral: true,
        });
      }
      try {
        const tag = await interaction.client.db.tags.create({
          name: name,
          content: content,
          guild: interaction.guild.id,
        });

        return interaction.reply({
          content: `Tag **${name}** added.`,
          ephemeral: true,
        });
      } catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
          return interaction.reply({
            content: `The tag **${name}** already exists. Edit it with \`tag edit\`.`,
            ephemeral: true,
          });
        }
      }
    }
    if (interaction.options.getSubcommand() == "edit") {
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
          content: "You do not have permission to edit a tag.",
          ephemeral: true,
        });
      }

      const affectedRows = await interaction.client.db.tags.update(
        { content: content },
        { where: { name: name } }
      );

      if (affectedRows > 0) {
        return interaction.reply({
          content: `The tag **${name}** has been edited.`,
          ephemeral: true,
        });
      }

      return interaction.reply({
        content: `Could not find a tag with name **${name}**.`,
        ephemeral: true,
      });
    }
    if (interaction.options.getSubcommand() == "remove") {
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
          content: "You do not have permission to remove a tag.",
          ephemeral: true,
        });
      }
      const rowCount = await interaction.client.db.tags.destroy({
        where: { name: name, guild: interaction.guild.id },
      });

      if (!rowCount)
        return interaction.reply(`The **${name}** tag does not exist.`);

      return interaction.reply(`The **${name}** tag has been deleted.`);
    }
    if (interaction.options.getSubcommand() == "send") {
      const tag = await interaction.client.db.tags.findOne({
        where: { name: name, guild: interaction.guild.id },
      });
      if (tag.content) {
        interaction.reply({
          content: target ? `*Tag suggestion for <@${target.id}>:*\n ${tag.content}` : tag.content,
        });
      } else {
        interaction.reply({
          content: `Tag **${name}** not found!`,
          ephemeral: true,
        });
      }
    }
  },
};
