const { SlashCommandBuilder } = require("discord.js");
const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { Rcon } = require("rcon-client")



module.exports = {
  data: new SlashCommandBuilder()
    .setName("exec")
    .setDescription("Run a command")
    .addStringOption((option) =>
      option
        .setName("command")
        .setDescription("The command to execute.")
        .setRequired(true)
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

    const command = interaction.options.get("command").value;

    const response = await rcon.send(command)

    rcon.end()

    embed = new EmbedBuilder()
      .setTitle("Command Sent")
      .setColor("Green")
      .setDescription(`\`\`\`${response}\`\`\``);

    interaction.reply({ embeds: [embed], ephemeral: true });
  },
};