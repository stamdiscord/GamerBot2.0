const profileModel = require("../models/profileSchema");
const ms = require("ms");

module.exports = {
	name: "setxp",
	aliases: [],
	description: "Sätt xp eller xp timeout för en användare!",
	usage: [
		"setxp {<mentionedUser>|<userID>} -x <xpAmount>",
		"setxp {<mentionedUser>|<userID>} -t <xpTimeout>"
	],
	notes: [
		"*xpTimeout* mäts som standard i millisekunder från att du skickar detta kommando. Du kan också specificera värdet genom att sätta \`h\`, \`s\`, \`m\` etc. bakom. Exempel:\n\`60s\`, \`8h\` och \`2w\`"
	],
	perms: ["adminCmd"],
	async do(client, message, args, Discord) {
		let member;
		let user;
		if (!args[0]) {
			return message.channel.send("Du måste ange vilken användare du vill sätta xp'n för.");
		} else {
			if (message.mentions.members.first()) {
				member = message.mentions.members.first();
				user = message.mentions.users.first();
			} else {
				member = await message.guild.members.fetch(args[0]);
				user = await client.users.fetch(args[0]);
			}
		}
		if (!args[1]) return message.channel.send("Du måste ange minst en operation du vill utföra!");
		let profile_data = await profileModel.fetchProfile(member.id, message.guild.id);		//Fetch profile
		let fields = [];
		let completedOperations = [];
		for (let index = 1; index < args.length; index++) {
			if (args[index] === "-x") {
				if (completedOperations.includes("-x")) {
					index++;
					continue;
				}
				if (!args[index + 1]) return message.channel.send("Du måste berätta Xp-värdet för mig. Annars blir det lite krångligt...");
				if (isNaN(args[index + 1])) {
					return message.channel.send("Xp-värdet måste vara ett nummer!");
				} else {
					profile_data.xp = args[index + 1];
					fields.push({
						name: "XP",
						value: `Sätt ${member}'s xp till ${profile_data.xp}!`
					});
				}
				completedOperations.push("-x")
				index++;
			} else if (args[index] === "-t") {
				if (completedOperations.includes("-t")) {
					index++;
					continue;
				}
				if (!args[index + 1]) return message.channel.send("Ett värde för Xp-timeouten måste tillhandahållas.");
				if (ms(args[index + 1]) == undefined) {
					return message.channel.send("Xp-timeouten måste kunna omvandlas till millisekunder!");
				} else {
					profile_data.xpTimeoutUntil = message.createdTimestamp + ms(args[index + 1]);
					fields.push({
						name: "XP Timeout",
						value: `Sätt ${member}'s xp timeout till ${profile_data.xpTimeoutUntil}!`
					});
				}
				completedOperations.push("-t")
				index++;
			} else if (!completedOperations.includes(args[index])) {
				completedOperations.push(args[index]);
			}
		}
		for (let operation of completedOperations) {
			if ((operation !== "-x") && (operation !== "-t")) {
				return message.channel.send(`Du specificerade operationen ${operation} som inte finns. Använd help-kommandot för att se användningen av det här kommandot samt de tillgängliga operationerna.`);
			}
		}
		profile_data.save()
		
		const embed = new Discord.MessageEmbed()
			.setColor("#f54242")
			.setTitle(`Set xp`)
			.addFields(
				fields
			)
		message.channel.send(embed);
	}
}