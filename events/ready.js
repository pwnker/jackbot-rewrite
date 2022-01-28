module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {
		client.user.setStatus('dnd');
		console.log(`Ready! Logged in as ${client.user.tag}`);
		client.user.setActivity('/support', { type: "WATCHING" });
		setInterval (() => {
		client.user.setActivity('/support', { type: "WATCHING" });
		}, 10800000);
}};