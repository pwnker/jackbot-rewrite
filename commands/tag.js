const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');


module.exports = {
	data: new SlashCommandBuilder()
    .setName('tag')
    .setDescription('Fetch or create a tag.')
    .addSubcommand(subcommand =>
        subcommand
            .setName('list')
            .setDescription('List all tags.')
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('view')
            .setDescription('Send a tag to the current channel.')
            .addStringOption(option =>
                option.setName('name')
                .setAutocomplete(true)
                .setDescription('The name of the tag.')
                .setRequired(true))
            .addUserOption((option) =>
                option
                    .setName("user")
                    .setDescription("The user to direct the tag to.")
                    
            ))
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Create a tag')
                .addStringOption(option =>
                    option.setName('name')
                    .setDescription('The name of the tag.')
                    .setRequired(true))
                .addStringOption(option =>
                option.setName('content')
                .setDescription('The content of the tag to add.')
                .setRequired(true)
        ))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove a tag')
                .addStringOption(option =>
                    option.setName('name')
                    .setAutocomplete(true)
                    .setDescription('The name of the tag.')
                    .setRequired(true))
        ),
            


	async execute(interaction) {
        tag = interaction.options.getString('name');
        content = interaction.options.getString('content');
        target = interaction.options.getUser('user');
    
        if (interaction.options.getSubcommand() == 'list') {
            const tags = []
            await interaction.client.db.indexes.forEach(async (index) => {
                if (index.startsWith('tag-')) {
                    tags.push(index.split('-')[1])
                }
            })
            string = tags.join(', ')
            const embed = new MessageEmbed()
                .setColor('AQUA')
                .setTitle('Tags')
                .setDescription(`${string}`)
                .setFooter({text:'Use /tag view <tag> to view a tag.'})
            return await interaction.reply({embeds: [embed], ephemeral: true});
            }

        if (interaction.options.getSubcommand() == 'create') {
            if (!interaction.member.roles.cache.some(role => role.id === process.env.ADMIN_ROLE)) {
                return interaction.reply({content:'You do not have permission to create a tag.',  ephemeral: true });
            }
            await interaction.client.db.set(`tag-${tag}`, content);
            return interaction.reply({
                content: `Created the **${tag}** tag.`,
                ephemeral: true,
            });
        }
        if (interaction.options.getSubcommand() == 'remove') {
            if (!interaction.member.roles.cache.some(role => role.id === process.env.ADMIN_ROLE)) {
                return interaction.reply({content:'You do not have permission to remove a tag.',  ephemeral: true });
            }
            await interaction.client.db.delete(`tag-${tag}`);
            return interaction.reply({
                content: `Removed the **${tag}** tag.`,
                ephemeral: true,
            });
        }
        if (interaction.options.getSubcommand() == 'view') {
            content = await interaction.client.db.get(`tag-${tag}`);
            if (content) {
                interaction.channel.send({
                    content: target ? `<@${target.id}>, ${content}` : content,
                });
                await interaction.reply({
                    content: `Sent the **${tag}** tag.`,
                    ephemeral: true,
                });
            } else {
                interaction.reply({
                    content: `Tag **${tag}** not found!`,
                    ephemeral: true,
                });
            }
        }
}};