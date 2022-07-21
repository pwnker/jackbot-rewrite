const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a song from the interwebs.")
    .addStringOption((option) =>
      option.setName("query").setDescription("The song to play.")
        .setRequired(true)
    ),


  async execute(interaction) {
    if (!interaction.member.voice.channel) {
      return await interaction.reply({
        content: "You must be in a voice channel to use this command.",
        ephemeral: true,
      });
    }

    await interaction.deferReply({ ephemeral: true });
    const guild = interaction.guild;
    const channel = interaction.channel;
    const query = interaction.options.get("query").value;

    const searchResult = await interaction.client.player.search(query, {
      requestedBy: interaction.user,
    });
    if (!searchResult || !searchResult.tracks.length)
      return interaction.followUp({ content: "No results were found!" });

    const queue = await interaction.client.player.createQueue(guild, {
      ytdlOptions: {
        filter: "audioonly",
        highWaterMark: 1 << 30,
        dlChunkSize: 0,
      },
      metadata: channel,
      leaveOnEmptyCooldown: 30000,
      leaveOnEnd: false
    });
 
    queue.votes = []



    const member = interaction.member;
    try {
      if (!queue.connection) await queue.connect(member.voice.channel);
    } catch {
      client.player.deleteQueue(interaction.guildID);
      return interaction.followUp({
        content: "Could not join your voice channel!",
      });
    }

    await interaction.followUp({
      content: `⏱ | Loading ${searchResult.playlist ? searchResult.playlist.tracks.length + " songs from " + searchResult.playlist.title : searchResult.tracks[0].title + " by " + searchResult.tracks[0].author
        }...`,
    });
    searchResult.playlist
      ? queue.addTracks(searchResult.tracks)
      : queue.addTrack(searchResult.tracks[0]);
    if (!queue.playing) await queue.play();
  },
};
