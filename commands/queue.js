const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const embed = require("./embed");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("queue")
        .setDescription("View the queue.")
        .addIntegerOption((option) =>
            option
                .setName("page")
                .setDescription("The page to view.")
        ),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const queue = interaction.client.player.getQueue(interaction.guildId);
        if (!queue || !queue.playing)
            return interaction.followUp({
                content: "❌ | No music is being played!",
            });

        var page = interaction.options.getInteger("page")

        if (!page) page = 1;
        const pageStart = 10 * (page - 1);
        const pageEnd = pageStart + 10;
        const currentTrack = queue.current;
        const tracks = queue.tracks.slice(pageStart, pageEnd).map((m, i) => {
            return `${i + pageStart + 1}. **${m.title}** ([link](${m.url}))`;
        });

        const embed = new EmbedBuilder()
            .setTitle("Server Queue")
            .setDescription(`${tracks.join('\n')}${queue.tracks.length > pageEnd
                ? `\n...${queue.tracks.length - pageEnd} more track(s)`
                : 'No songs in queue.'
                }`)
            .setColor("Aqua")
            .addFields({ name: 'Now Playing', value: `🎶 | **${currentTrack.title}** ([link](${currentTrack.url}))` })
        return interaction.followUp({ embeds: [embed] });

    },
};
