const Discord = require("discord.js");
const functions = require("../functions");
const profileModel = require("../models/profileSchema");

module.exports = {
	name: "voice",
	aliases: ["vc"],
	description: "Använd detta kommando för att hantera privata röstkanaler, bjuda in andra etc.",
	usage: [
		"voice invite <userID>",
		"voice kick <userID>"
	],
	perms: [],
	async do(message, args) {
		let profileData = await profileModel.fetchProfileFromMessage(message);

		if (profileData.privateVoiceID !== message.member.voice.channelID) return message.channel.send("Du måste vara i en privat röstkanal som tillhör dig för att använda det här kommandot.")

		let channel = message.guild.channels.cache.get(profileData.privateVoiceID);

		if (!args[0]) {		//Show information about the user's private voice channel
			const embed = new Discord.MessageEmbed()
				.setColor("#0099ff")
				.setTitle(`${message.author.tag}'s röstkanal`)
				.addFields(
					{ name: "Inbjudna", value: `Inte färdigt än` }
				)
				.setTimestamp()
			return message.channel.send(embed);
		}

		switch (args[0]) {
		case "invite":
			channel.updateOverwrite(args[1], {
				"VIEW_CHANNEL": true,
				"SPEAK": true,
				"CONNECT": true
			});
			return message.channel.send(`Jag bjöd in ${client.users.cache.get(args[1]).tag} till samtalet.`)
		case "kick":
			channel.updateOverwrite(args[1], {
				"VIEW_CHANNEL": false,
				"SPEAK": false,
				"CONNECT": false
			});
			return message.channel.send(`${client.users.cache.get(args[1]).tag} har inte längre tillgång till samtalet.`)
		}
	}
}