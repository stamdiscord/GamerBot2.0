const guildConfig = require("../models/guildConfigSchema");
const Discord = require('discord.js');

module.exports = {
	name: "serveropt",
	aliases: ["serveroptions"],
	description: "Visa och ändra Discord-serverspecifika inställningar.",
	usage: [
		"serveropt",
		"serveropt <variable>",
		"serveropt <variable> <value>"
	],
	perms: ["adminCmd"],
	async do(message, args) {
		let guildConfigData = await guildConfig.fetchGuildConfig(message.guild.id);			//Retreive guild config

		if (!args[1]) {         //0 or 1 arguments specified, show array of server options.
			let guildConfigData2 = JSON.parse(JSON.stringify(guildConfigData));
			guildConfigData2.guildID = undefined;
			guildConfigData2._id = undefined;
			guildConfigData2.__v = undefined;

			if (args[0]) {
				if (guildConfigData2[args[0]] == undefined) {
					return message.channel.send(`Variabeln "${args[0]}" är odefinierad.`);
				}
				const embed = new Discord.MessageEmbed()
					.setColor("#f54242")
					.setTitle(`${args[0]} - Server config`)
					.setDescription(`Visar värdet av variabeln *${args[0]}*.`)
					.addFields(
						{ name: "Värde:", value: `\`\`\`json\n${JSON.stringify(guildConfigData2[args[0]], null, 4)}\`\`\`` }
					)
				return message.channel.send(embed);
			} else {
				const embed = new Discord.MessageEmbed()
					.setColor("#f54242")
					.setTitle(`Server config`)
					.setDescription(`Konfigurationen för denna Discord-server ser just nu ut såhär!`)
					.addFields(
						{ name: "Konfiguration:", value: `\`\`\`json\n${JSON.stringify(guildConfigData2, null, 4)}\`\`\`` }
					)
				return message.channel.send(embed);
			}
		}

		guildConfigData[args[0]] = JSON.parse(args.slice(1, args.length).join(" "));	//Change specified variable
		await guildConfigData.save();
		
		message.channel.send(`Set "${args[0]}" value to "${guildConfigData[args[0]]}"`);
	}
}