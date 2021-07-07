const configModel = require("../models/configSchema");
const Discord = require('discord.js');

module.exports = {
	name: "confget",
	aliases: ["configget", "getconf"],
	description: "Skicka värdet av config-variabler.",
	usage: [
		"confget",
		"confget <variable>"
	],
	perms: ["adminCmd"],
	async do(message, args, profileData) {

		//Retreive options
		let configDataRaw = await configModel.fetchConfig(process.env.config_id);		//Retreive options

		let configDataParsed = JSON.parse(JSON.stringify(configDataRaw));
		delete configDataParsed.id;
		delete configDataParsed._id;
		delete configDataParsed.__v;

		if (args[0]) {
			if (configDataParsed[args[0]] == undefined) {
				return message.channel.send(`Config-variabeln "${args[0]}" är odefinierad.`);
			}
			const embed = new Discord.MessageEmbed()
				.setColor("#f54242")
				.setTitle(`${args[0]} - Config`)
				.setDescription(`Visar värdet av config-variabeln *${args[0]}*.`)
				.addFields(
					{ name: "Värde:", value: `\`\`\`json\n${JSON.stringify(configDataParsed[args[0]], null, 4)}\`\`\`` }
				)
			return message.channel.send(embed);
		} else {
			var settingsList = "";
			Object.keys(configDataParsed).forEach(setting => {
				settingsList = settingsList + setting + "\n";
			})

			const embed = new Discord.MessageEmbed()
				.setColor("#f54242")
				.setTitle(`Config`)
				.setDescription(`Du måste välja en config kategori under efter huvudkommandot. Dessa kategorier finns:`)
				.addFields(
					{ name: "Konfiguration:", value: settingsList },
					{ name: "ID:", value: `Den här boten använder konfigurationsdokumentet med id \`${configDataRaw.id}\`.` }
				)
			return message.channel.send(embed);
		}
	}
}