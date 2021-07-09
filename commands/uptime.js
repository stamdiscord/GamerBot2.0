const Discord = require("discord.js");
const functions = require("../functions");

module.exports = {
	name: "uptime",
	aliases: [],
	description: "Få information om hur länge botten har varit uppe sedan senaste omstart och när den startades om",
	usage: [],
	perms: [],
	async do(message, args, profileData) {
		let currentTime = new Date().getTime();
		let restartTime = new Date(currentTime - message.client.uptime);

		const embed = new Discord.MessageEmbed()
			.setColor("#0099ff")
			.setTitle("Uptime")
			.setDescription("Här kommer upptiden för botten!")
			.setThumbnail(message.client.user.avatarURL())
			.addFields(
				{ name: "Tid:", value: functions.msToString(message.client.uptime) },
				{ name: "Totala millisekunder:", value: message.client.uptime },
				{ name: "Omstart skedde vid:", value: restartTime.toLocaleDateString() + " " + restartTime.toLocaleTimeString() }
			)
			.setTimestamp()
		message.channel.send(embed);
	}
}