const { SlashCommandBuilder } = require("@discordjs/builders");
const shortenUrl = require("../functions/shortenUrl.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("shorten")
    .setDescription("Shorten a link.")
    .addStringOption((option) =>
      option.setName("url").setDescription("The long url.").setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("slug").setDescription("The slug for the URL.")
    ),

  async execute(interaction) {
    if (!interaction.user.id === 557106447771500545) {
      return interaction.reply({
        content: "This command can only be used in whitelisted guilds.",
        ephemeral: true,
      });
    }
    const url = interaction.options.getString("url");
    const slug = interaction.options.getString("slug");
    interaction.reply({
      content: await shortenUrl(url, slug),
      ephemeral: true,
    });
  },
};
