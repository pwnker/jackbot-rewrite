module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {
		client.user.setStatus('dnd');
		console.log(`Ready! Logged in as ${client.user.tag}`);
		client.user.setActivity('with Jack', { type: "PLAYING" });
		setInterval (() => {
		client.user.setActivity('with Jack', { type: "PLAYING" });
		}, 10800000);
}};