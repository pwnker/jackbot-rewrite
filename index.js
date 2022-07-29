const fs = require("fs");
const Sequelize = require("sequelize");
const { Player } = require("discord-player");
const {
  Client,
  Collection,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  InteractionType,
  ChannelType,
} = require("discord.js");
const dotenv = require("dotenv");
dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.commands = new Collection();
client.buttons = new Collection();
client.menus = new Collection();

// Load commands
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

client.on("interactionCreate", async (interaction) => {
  if (interaction.type === InteractionType.ApplicationCommand) {
    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    if (interaction.channel.type === ChannelType.DM) {
      return await interaction.reply({
        content: "You can only use this command in a server.",
        ephemeral: true,
      });
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      if (error.code === 50013) {
        var errorMsg =
          "Jackbot does not have the correct permissions to run this command.";
        if (interaction.deferred) {
          return interaction.editReply(errorMsg);
        } else {
          return interaction.reply(errorMsg);
        }
      }

      console.error(error);

      errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle(error.name)
        .setDescription("```" + error.stack + "```")
        .setTimestamp();

      client.channels.cache
        .get(process.env.BOT_LOG_CHANNEL)
        .send({ embeds: [errorEmbed] });

      var errorMsg = {
        content:
          "There was an error while executing this command! This error has been reported.",
        ephemeral: true,
      };

      if (interaction.deferred) {
        return interaction.editReply(errorMsg);
      } else {
        return interaction.reply(errorMsg);
      }
    }
  }

  if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
    if (!interaction.guild) return;
    if (interaction.commandName == "tag") {
      var options = await client.db.tags.findAll({
        attributes: ["name"],
        where: {
          guild: interaction.guild.id,
        },
      });
    }
    const focusedValue = interaction.options.getFocused();
    choices = options.map((o) => o.name);
    const filtered = choices.filter(
      (choice) =>
        choice.startsWith(focusedValue) ||
        choice.toLowerCase().startsWith(focusedValue)
    );
    interaction
      .respond(filtered.map((choice) => ({ name: choice, value: choice })))
      .catch(console.error);
  }
});

// Load events
const eventFiles = fs
  .readdirSync("./events")
  .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

// Load buttons
const buttonFiles = fs
  .readdirSync("./buttons")
  .filter((file) => file.endsWith(".js"));

for (const file of buttonFiles) {
  const button = require(`./buttons/${file}`);
  client.buttons.set(button.customId, button);
}

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;
  const button = client.buttons.get(interaction.customId);

  if (!button) return;

  try {
    await button.execute(interaction);
  } catch (error) {
    console.error(error);
    errorEmbed = new EmbedBuilder()
      .setColor("Red")
      .setTitle(error.name)
      .setDescription("```" + error.stack + "```");

    client.channels.cache
      .get(process.env.BOT_LOG_CHANNEL)
      .send({ embeds: [errorEmbed] });
    var errorMsg = {
      content:
        "There was an error while executing this command! This error has been reported.",
      ephemeral: true,
    };

    if (interaction.deferred) {
      return interaction.editReply(errorMsg);
    } else {
      return interaction.reply(errorMsg);
    }
  }
});

// Load menus
const menuFiles = fs
  .readdirSync("./menus")
  .filter((file) => file.endsWith(".js"));

for (const file of menuFiles) {
  const menu = require(`./menus/${file}`);
  client.menus.set(menu.customId, menu);
}

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isSelectMenu()) return;
  const menu = client.menus.get(interaction.customId);
  if (!menu) return;
  try {
    await menu.execute(interaction);
  } catch (error) {
    console.error(error);
    errorEmbed = new EmbedBuilder()
      .setColor("Red")
      .setTitle(error.name)
      .setDescription("```" + error.stack + "```");

    client.channels.cache
      .get(process.env.BOT_LOG_CHANNEL)
      .send({ embeds: [errorEmbed] });
    var errorMsg = {
      content:
        "There was an error while executing this command! This error has been reported.",
      ephemeral: true,
    };

    if (interaction.deferred) {
      return interaction.editReply(errorMsg);
    } else {
      return interaction.reply(errorMsg);
    }
  }
});

// db

client.db = new Sequelize(
  process.env.PGDATABASE,
  process.env.PGUSER,
  process.env.PGPASSWORD,
  {
    host: process.env.PGHOST,
    dialect: "postgres",
    native: false,
    logging: false,
  }
);

client.db.tags = client.db.define(
  "tags",
  {
    name: {
      type: Sequelize.STRING,
    },
    content: { type: Sequelize.TEXT },
    guild: { type: Sequelize.BIGINT },
  },

  {
    indexes: [
      {
        unique: true,
        fields: ["name", "guild"],
      },
    ],
  }
);

client.db.settings = client.db.define("settings", {
  name: {
    type: Sequelize.STRING,
  },
  value: Sequelize.BIGINT,
  guild: { type: Sequelize.BIGINT },
});

// errors

process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
  errorEmbed = new EmbedBuilder()
    .setColor("Red")
    .setTitle(error.name)
    .setDescription("```" + error.stack + "```");

  client.channels.cache
    .get(process.env.BOT_LOG_CHANNEL)
    .send({ embeds: [errorEmbed] });
});

client.on("shardError", (error) => {
  console.error("A websocket connection encountered an error:", error);
  errorEmbed = new EmbedBuilder()
    .setColor("Red")
    .setTitle(error.name)
    .setDescription("```" + error.stack + "```");

  client.channels.cache
    .get(process.env.BOT_LOG_CHANNEL)
    .send({ embeds: [errorEmbed] });
});

// Music
client.player = new Player(client);

musicEmbed = new EmbedBuilder().setColor("Green");

musicRow = new ActionRowBuilder().addComponents(
  new ButtonBuilder()
    .setCustomId("playPause")
    .setLabel("⏯️")
    .setStyle(ButtonStyle.Primary),
  new ButtonBuilder()
    .setCustomId("skip")
    .setLabel("⏭️")
    .setStyle(ButtonStyle.Danger)
);

client.player.on("trackStart", (queue, track) => {
  musicEmbed.setTitle(`Now playing: ${track.title}`);
  musicEmbed.setFooter({
    text: `Requested by: ${track.requestedBy.username} | ${track.source}`,
  });
  musicEmbed.setThumbnail(track.thumbnail);
  musicEmbed.setDescription(
    `[${track.title}](${track.url}) by ${track.author}`
  );

  musicRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("playPause")
      .setEmoji("⏯️")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("skip")
      .setEmoji(`⏭️`)
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("clear")
      .setEmoji("🗑️")
      .setStyle(ButtonStyle.Danger)
  );

  queue.metadata.send({ embeds: [musicEmbed], components: [musicRow] });
});

client.player.on("trackAdd", (queue, track) => {
  queue.metadata.send(`🎶 | **${track.title}** queued!`);
});

client.player.on("botDisconnect", (queue) => {
  queue.metadata.send(
    "❌ | I was manually disconnected from the voice channel, clearing queue!"
  );
});

client.player.on("channelEmpty", (queue) => {
  queue.metadata.send("❌ | Nobody is in the voice channel, leaving...");
});

client.player.on("queueEnd", (queue) => {
  queue.metadata.send("✅ | Queue finished!");
});

client.player.on("error", (queue, error) => {
  console.log(error);
  errorEmbed = new EmbedBuilder()
    .setColor("Red")
    .setTitle(error.name)
    .setDescription("```" + error.stack + "```");

  client.channels.cache
    .get(process.env.BOT_LOG_CHANNEL)
    .send({ embeds: [errorEmbed] });
});

client.player.on("connectionError", (queue, error) => {
  console.log(error);
  errorEmbed = new EmbedBuilder()
    .setColor("Red")
    .setTitle(error.name)
    .setDescription("```" + error.stack + "```");

  client.channels.cache
    .get(process.env.BOT_LOG_CHANNEL)
    .send({ embeds: [errorEmbed] });
});

client.login(process.env.TOKEN);
