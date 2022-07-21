const { SlashCommandBuilder } = require("discord.js");
const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { Rcon } = require("rcon-client")



module.exports = {
  data: new SlashCommandBuilder()
    .setName("whitelist")
    .setDescription("Whitelist a user.")
    .addStringOption((option) =>
      option
        .setName("username")
        .setDescription("The player's Minecraft username.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("edition")
        .setDescription("The player's Minecraft Edition")
        .setRequired(true)
        .addChoices(
          { name: 'Java', value: 'java' },
          { name: 'Bedrock', value: 'bedrock' }
        )
    ),


  async execute(interaction) {
    if (interaction.user.id != 557106447771500545) {
      return interaction.reply({
        content: "This command can only be used in whitelisted guilds.",
        ephemeral: true,
      });
    }

    const rcon = await Rcon.connect({
      host: "mc", port: 25575, password: process.env.RCON_PASS
    })

    const username = interaction.options.getString("username");

    if (interaction.options.getString("editon") == 'java') {
      var response = await rcon.send(`whitelist add ${username}`)
    } else {
      var response = await rcon.send(`fwhitelist add ${username}`)
    }

    rcon.end()

    embed = new EmbedBuilder()
      .setTitle("Command Sent")
      .setColor("Green")
      .setDescription(`\`\`\`${response}\`\`\``);

    interaction.reply({ embeds: [embed], ephemeral: true });
  },
};