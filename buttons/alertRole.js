module.exports = {
  customId: "alertRole",
  async execute(interaction) {
    eventRole = await interaction.guild.roles.cache.get(
      process.env.ALERTS_ROLE
    );
    if (
      interaction.member.roles.cache.some(
        (role) => role.id === process.env.ALERTS_ROLE
      )
    ) {
      await interaction.member.roles.remove(eventRole);
      return interaction.reply({
        content: `You have unsubscribed from **announcements** notifications.`,
        ephemeral: true,
      });
    } else {
      await interaction.member.roles.add(eventRole);
      return interaction.reply({
        content: `You have subscirbed to **announcements** notifications.`,
        ephemeral: true,
      });
    }
  },
};
