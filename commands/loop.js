const { SlashCommandBuilder } = require("discord.js");
const { QueueRepeatMode } = require('discord-player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("loop")
        .setDescription("Play music forever.")
        .addIntegerOption((option) =>
            option
                .setName("mode")
                .setDescription("The loop mode.")
                .setRequired(true)
                .addChoices(
                    {
                        name: 'Off',
                        value: QueueRepeatMode.OFF
                    },
                    {
                        name: 'Track',
                        value: QueueRepeatMode.TRACK
                    },
                    {
                        name: 'Queue',
                        value: QueueRepeatMode.QUEUE
                    },
                    {
                        name: 'Autoplay',
                        value: QueueRepeatMode.AUTOPLAY
                    }
                )
        ),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const queue = interaction.client.player.getQueue(interaction.guildId);
        if (!queue || !queue.playing)
            return interaction.followUp({
                content: "❌ | No music is being played!",
            });

        const loopMode = interaction.options.getInteger("mode");
        const success = queue.setRepeatMode(loopMode);
        if (loopMode == QueueRepeatMode.AUTOPLAY && success) {
            queue.repeatmode = "ON"
        }
        const mode = loopMode === QueueRepeatMode.TRACK ? '🔂' : loopMode === QueueRepeatMode.QUEUE ? '🔁' : '▶';
        return interaction.followUp({ content: success ? `${mode} | Updated loop mode!` : '❌ | Could not update loop mode!' });

    },
};