const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, Permissions } = require("discord.js");
const { Rcon } =  require("rcon-client")



module.exports = {
  data: new SlashCommandBuilder()
    .setName("whitelist")
    .setDescription("Whitelist a user.")
    .addStringOption((option) =>
      option
        .setName("username")
        .setDescription("The user's username.")
        .setRequired(true)
    ),


  async execute(interaction) {
    if (!interaction.user.id === 557106447771500545) {
        return interaction.reply({
          content: "This command can only be used in whitelisted guilds.",
          ephemeral: true,
        });
      }

      const rcon = await Rcon.connect({
        host: "mc", port: 25575, password: process.env.RCON_PASS
    })

    const username = interaction.options.get("username").value;

    const response = await rcon.send(`whitelist add ${username}`)

    rcon.end()
    
    embed = new MessageEmbed()
      .setTitle("Command Sent")
      .setColor("GREEN")
      .setDescription(`\`\`\`${response}\`\`\``);

    interaction.reply({ embeds: [embed], ephemeral: true });
  },
};