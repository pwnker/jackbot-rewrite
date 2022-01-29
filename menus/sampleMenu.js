const { MessageActionRow, MessageEmbed, MessageButton } = require("discord.js");
const dotenv = require("dotenv");
const { env } = require("process");
dotenv.config();

module.exports = {
  customId: "someMenu",
  async execute(interaction) {},
};
