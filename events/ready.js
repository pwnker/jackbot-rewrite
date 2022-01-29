const { Octokit } = require("@octokit/rest")
const { MessageEmbed } = require('discord.js');

const octokit = new Octokit({})
module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {
		client.user.setStatus('dnd');

		  
		response = await octokit.request('GET /repos/{owner}/{repo}/commits', {
			owner: 'pwnker',
			repo: 'jackbot-rewrite',
			per_page: 1
		  })
		  
		const embed = new MessageEmbed()
		.setTitle('Restarted')
		.setDescription('JackBot has restarted and pulled the latest changes into production.')
		.addFields(
			{ name: 'Commit', value: `[${response.data[0].commit.message}](${response.data[0].html_url})` },
			{ name: 'Author', value: `${response.data[0].commit.author.name}` },
		)
		.setTimestamp()
		.setColor('AQUA')
		
		client.channels.cache.get(process.env.BOT_LOG_CHANNEL).send({embeds: [embed]})
		  

		console.log(`Ready! Logged in as ${client.user.tag}`);
		client.user.setActivity(`${client.users.cache.size} discord users`, { type: "WATCHING" });
		setInterval (() => {
		client.user.setActivity(`${client.users.cache.size} discord users`, { type: "WATCHING" });
		}, 10800000);
}};