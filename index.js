const fs = require("fs");
const {
  Client,
  Collection,
  Intents,
  MessageEmbed,
  MessageActionRow,
  MessageButton,
} = require("discord.js");
const { DiscordTogether } = require("discord-together");
const dotenv = require("dotenv");
const Enmap = require("enmap");
dotenv.config();

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_INVITES,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGES,
  ],
});

client.discordTogether = new DiscordTogether(client);
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
  if (interaction.isCommand()) {
    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      errorEmbed = new MessageEmbed()
        .setColor("RED")
        .setTitle(error.name)
        .setDescription("```" + error.stack + "```")
        .setTimestamp()


      client.channels.cache
        .get(process.env.BOT_LOG_CHANNEL)
        .send({ embeds: [errorEmbed] });

      return interaction.reply({
        content: "There was an error while executing this command! This error has been reported.",
        ephemeral: true,
      });
    }
  }

  if (interaction.isAutocomplete()) {
    if (interaction.commandName == "tag") {
      const focusedValue = interaction.options.getFocused();
      const choices = [];
      const tags = await client.db.indexes;
      tags.forEach((tag) => {
        if (tag.startsWith("tag-")) {
          choices.push(tag.replace("tag-", ""));
        }
      });
      const filtered = choices.filter((choice) =>
        choice.startsWith(focusedValue)
      );
      interaction
        .respond(filtered.map((choice) => ({ name: choice, value: choice })))
        .catch(console.error);
    }
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
    errorEmbed = new MessageEmbed()
        .setColor("RED")
        .setTitle(error.name)
        .setDescription("```" + error.stack + "```");

      client.channels.cache
        .get(process.env.BOT_LOG_CHANNEL)
        .send({ embeds: [errorEmbed] });
    return interaction.reply({
      content: "There was an error while using this button! This error has been reported.",
      ephemeral: true,
    });
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
    errorEmbed = new MessageEmbed()
        .setColor("RED")
        .setTitle(error.name)
        .setDescription("```" + error.stack + "```");

      client.channels.cache
        .get(process.env.BOT_LOG_CHANNEL)
        .send({ embeds: [errorEmbed] });
    return interaction.reply({
      content: "There was an error while using this menu! This error has been reported.",
      ephemeral: true,
    });
  }
});

// db
client.db = new Enmap({ name: "bot" });

// errors

process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
  errorEmbed = new MessageEmbed()
        .setColor("RED")
        .setTitle(error.name)
        .setDescription("```" + error.stack + "```");

      client.channels.cache
        .get(process.env.BOT_LOG_CHANNEL)
        .send({ embeds: [errorEmbed] });

});

client.on("shardError", (error) => {
  console.error("A websocket connection encountered an error:", error);
  errorEmbed = new MessageEmbed()
        .setColor("RED")
        .setTitle(error.name)
        .setDescription("```" + error.stack + "```");

      client.channels.cache
        .get(process.env.BOT_LOG_CHANNEL)
        .send({ embeds: [errorEmbed] });
});

client.login(process.env.TOKEN);
