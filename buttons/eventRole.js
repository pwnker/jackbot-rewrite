module.exports = {
	customId: 'eventRole',
	async execute(interaction) {
        eventRole = await interaction.guild.roles.cache.get(process.env.EVENTS_ROLE)
        if (interaction.member.roles.cache.some(role => role.id === process.env.EVENTS_ROLE)) {
            await interaction.member.roles.remove(eventRole);
            return interaction.reply({
                content: `You have unsubscribed from **event** notifications.`,
                ephemeral: true,
            });
        } else {
            await interaction.member.roles.add(eventRole);
            return interaction.reply({
                content: `You have subscirbed to **event** notifications.`,
                ephemeral: true,
            });
        }
    }}