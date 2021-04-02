const profileModel = require("../../models/profileSchema");
const configModel = require("../../models/configSchema");
const Discord = require("discord.js");

module.exports = (client) => {
	console.log(`${client.user.username} is online! Hosting ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`);

	//Register commands
	client.api.applications(client.user.id).guilds("813844220694757447").commands.post({
		data: {
			name: "ping",
			description: "hello world command",
			options: [
				{
					"type": 3,
					"name": "testname",
					"description": "testdesc",
				}
			]
		}
	});


	client.ws.on('INTERACTION_CREATE', async interaction => {
		const cmd = interaction.data.name.toLowerCase();
		const args = interaction.data.options;

		console.log(interaction)

		//Create message object
		let message = new Discord.Message(client, {
			id: interaction.id,
			type: 4,
			content: interaction.data.name,
			author: client.user,
			pinned: false,
			tts: false,
			embeds: [],
			attachments: [],
			nonce: "123" // idfk
		}, client.channels.cache.get(interaction.channel_id))

		//Retreive options
		let configData = await configModel.fetchConfig(process.env.config_id);		//Retreive options
	
		if (configData.debug && (client.commands.get(cmd) || client.commands.find(a => a.aliases && a.aliases.includes(cmd)))) {
			try {
				delete require.cache[require.resolve(`../../commands/${cmd}.js`)];
				client.commands.delete(cmd);
				const pull = require(`../../commands/${cmd}.js`);
				client.commands.set(cmd, pull);
			} catch (err) {
				console.log(err);
			}
		}
	
		const command = client.commands.get(cmd) || client.commands.find(a => a.aliases && a.aliases.includes(cmd));
		
		let profileData = await profileModel.fetchProfile(interaction.member.user.id, interaction.guild_id);		//Fetch profile
	
		if (command) {
			if (command.perms.includes("adminCmd")) {
				if (interaction.member.hasPermission("ADMINISTRATOR")) {
					try {
						await command.do(message, args, profileData);
					} catch (err) {
						console.log(err);
						client.api.interactions(interaction.id, interaction.token).callback.post({
							data: {
								type: 4,
								data: {
									content: "Det har inträffat ett fel med det här kommandot. Se konsolen för mer information!"
								}
							}
						})
					}
				} else {
					client.api.interactions(interaction.id, interaction.token).callback.post({
						data: {
							type: 4,
							data: {
								content: "Du har inte tillåtelse att exekvera det här kommandot!"
							}
						}
					})
				}
			} else {
				try {
					await command.do(message, args, profileData);
				} catch (err) {
					console.log(err);
					client.api.interactions(interaction.id, interaction.token).callback.post({
						data: {
							type: 4,
							data: {
								content: "Det har inträffat ett fel med det här kommandot. Se konsolen för mer information!"
							}
						}
					})
				}
			}
		}
	});

}