const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, Permissions } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("settings")
    .setDescription("Configure Jackbot for your server.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("modrole")
        .setDescription("Set or veiw the Jackbot Moderator role.")
        .addRoleOption((option) =>
          option.setName("role").setDescription("The moderator role.")
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("adminrole")
        .setDescription("Set or view the Jackbot Admin role.")
        .addRoleOption((option) =>
          option.setName("role").setDescription("The admin role.")
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("logs")
        .setDescription("Set or veiw the Jackbot Log channel.")
        .addChannelOption((option) =>
          option.setName("channel").setDescription("The log channel.")
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("welcome")
        .setDescription("Set or veiw the Jackbot welcome channel.")
        .addChannelOption((option) =>
          option.setName("channel").setDescription("The welcome channel.")
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("joinrole")
        .setDescription("Set or veiw the Jackbot join role.")
        .addRoleOption((option) =>
          option.setName("role").setDescription("The join role.")
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("reset")
        .setDescription("Reset a setting to its default value.")
        .addStringOption((option) =>
          option.setName("setting").setDescription("The setting to reset.")
          .setRequired(true)
          .addChoice("Moderator Role", "modRole")
          .addChoice("Admin Role", "adminRole")
          .addChoice("Log Channel", "logChannel")
          .addChoice("Welcome Channel", "welcomeChannel")
          .addChoice("Join Role", "joinRole")
          .addChoice("All", "all")
        )
    ),

  async execute(interaction) {
    if (!interaction.guild) {
      return await interaction.reply({
        content: "You can only use this command in a server.",
        ephemeral: true,
      });
    }

    var adminRole = await interaction.client.db.settings.findOne({
      attributes: ["value"],
      where: { name: "adminRole", guild: interaction.guild.id },
    });

    if (
      !interaction.member.roles.cache.some(
        (role) => role.id === adminRole?.value
      ) &&
      !interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)
    ) {
      return interaction.reply({
        content: "You do not have permission to use this command.",
        ephemeral: true,
      });
    }

    if (interaction.options.getSubcommand() == "reset") {
      let setting = interaction.options.getString("setting");
      if (setting == "all") {
        await interaction.client.db.settings.destroy({
          where: { guild: interaction.guild.id },
        });
        return await interaction.reply({
          content: "All settings have been reset.",
          ephemeral: true,
        });
      }
      await interaction.client.db.settings.destroy({
        where: { name: setting, guild: interaction.guild.id },
      });
      // Make setting human readable with a space between words.
      setting = setting.replace(/([A-Z])/g, " $1");
      setting = setting.charAt(0).toUpperCase() + setting.slice(1);

      return await interaction.reply({
        content: `The **${setting}** setting has been reset.`,
        ephemeral: true,
      });
    }


    if (interaction.options.getSubcommand() == "welcome") {
      const channel = interaction.options.getChannel("channel");

      if (channel && !channel.isText()) {
        return interaction.reply({
          content: "Welcome channel must be a text channel.",
          ephemeral: true,
        });
      }

      var welcomeChannel = await interaction.client.db.settings.findOne({
        attributes: ["value"],
        where: { name: "welcomeChannel", guild: interaction.guild.id },
      });

      if (welcomeChannel && channel) {
        await interaction.client.db.settings.update(
          { value: channel.id },
          {
            where: {
              name: "welcomeChannel",
              guild: interaction.guild.id,
            },
          }
        );

        return interaction.reply({
          content: `Welcome channel set to <#${channel.id}>`,
          ephemeral: true,
        });
      }

      if (channel) {
        await interaction.client.db.settings.create({
          name: "welcomeChannel",
          guild: interaction.guild.id,
          value: channel?.id,
        });

        return interaction.reply({
          content: `Welcome channel set to <#${channel.id}>`,
          ephemeral: true,
        });
      }

      if (!welcomeChannel) {
        return interaction.reply({
          content: `The welcome channel has not been set. Set it with \`/settings welcome <channel>\``,
          ephemeral: true,
        });
      } else {
        interaction.reply({
          content: `The welcome channel is currently set to <#${welcomeChannel?.value}>`,
          ephemeral: true,
        });
      }
    }

    if (interaction.options.getSubcommand() == "logs") {
      const channel = interaction.options.getChannel("channel");

      if (channel && !channel.isText()) {
        return interaction.reply({
          content: "Log channel must be a text channel.",
          ephemeral: true,
        });
      }

      var logChannel = await interaction.client.db.settings.findOne({
        attributes: ["value"],
        where: { name: "logChannel", guild: interaction.guild.id },
      });

      if (logChannel && channel) {
        await interaction.client.db.settings.update(
          { value: channel.id },
          {
            where: {
              name: "logChannel",
              guild: interaction.guild.id,
            },
          }
        );

        return interaction.reply({
          content: `Log channel set to <#${channel.id}>`,
          ephemeral: true,
        });
      }

      if (channel) {
        await interaction.client.db.settings.create({
          name: "logChannel",
          guild: interaction.guild.id,
          value: channel?.id,
        });

        return interaction.reply({
          content: `Log channel set to <#${channel.id}>`,
          ephemeral: true,
        });
      }

      if (!logChannel) {
        return interaction.reply({
          content: `The logging channel has not been set. Set it with \`/settings logs <channel>\``,
          ephemeral: true,
        });
      } else {
        interaction.reply({
          content: `The log channel is currently set to <#${logChannel?.value}>`,
          ephemeral: true,
        });
      }
    }

    if (interaction.options.getSubcommand() == "modrole") {
      const role = interaction.options.getRole("role");

      var modRole = await interaction.client.db.settings.findOne({
        attributes: ["value"],
        where: { name: "modRole", guild: interaction.guild.id },
      });

      if (modRole && role) {
        await interaction.client.db.settings.update(
          { value: role.id },
          {
            where: {
              name: "modRole",
              guild: interaction.guild.id,
            },
          }
        );

        return interaction.reply({
          content: `Mod role set to <@&${role.id}>`,
          ephemeral: true,
        });
      }

      if (role) {
        await interaction.client.db.settings.create({
          name: "modRole",
          guild: interaction.guild.id,
          value: role?.id,
        });

        return interaction.reply({
          content: `Mod role set to <@&${role.id}>`,
          ephemeral: true,
        });
      }

      if (!modRole) {
        return interaction.reply({
          content: `The mod role has not been set, only administrators can use commands.`,
          ephemeral: true,
        });
      } else {
        interaction.reply({
          content: `Mod role is currently set to <@&${modRole?.value}>`,
          ephemeral: true,
        });
      }
    }

    if (interaction.options.getSubcommand() == "adminrole") {
      const role = interaction.options.getRole("role");

      var adminRole = await interaction.client.db.settings.findOne({
        attributes: ["value"],
        where: { name: "adminRole", guild: interaction.guild.id },
      });

      if (adminRole && role) {
        await interaction.client.db.settings.update(
          { value: role.id },
          {
            where: {
              name: "modRole",
              guild: interaction.guild.id,
            },
          }
        );

        return interaction.reply({
          content: `Admin role set to <@&${role.id}>`,
          ephemeral: true,
        });
      }

      if (role) {
        await interaction.client.db.settings.create({
          name: "adminRole",
          guild: interaction.guild.id,
          value: role?.id,
        });

        return interaction.reply({
          content: `Admin role set to <@&${role.id}>`,
          ephemeral: true,
        });
      }

      if (!adminRole) {
        return interaction.reply({
          content: `The admin role has not been set, only administrators can use commands.`,
          ephemeral: true,
        });
      } else {
        interaction.reply({
          content: `Admin role is currently set to <@&${adminRole?.value}>`,
          ephemeral: true,
        });
      }
    }

    if (interaction.options.getSubcommand() == "joinrole") {
      const role = interaction.options.getRole("role");

      var joinRole = await interaction.client.db.settings.findOne({
        attributes: ["value"],
        where: { name: "joinRole", guild: interaction.guild.id },
      });

      if (joinRole && role) {
        await interaction.client.db.settings.update(
          { value: role.id },
          {
            where: {
              name: "joinRole",
              guild: interaction.guild.id,
            },
          }
        );

        return interaction.reply({
          content: `Join role set to <@&${role.id}>`,
          ephemeral: true,
        });
      }

      if (role) {
        await interaction.client.db.settings.create({
          name: "joinRole",
          guild: interaction.guild.id,
          value: role?.id,
        });

        return interaction.reply({
          content: `Join role set to <@&${role.id}>`,
          ephemeral: true,
        });
      }

      if (!joinRole) {
        return interaction.reply({
          content: `The join role has not been set, only administrators can use commands.`,
          ephemeral: true,
        });
      } else {
        interaction.reply({
          content: `The join role is currently set to <@&${joinRole?.value}>`,
          ephemeral: true,
        });
      }
    }
  },
};
