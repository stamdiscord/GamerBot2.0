const Discord = require('discord.js');
const ms = require("ms");
const {SlashCommandBuilder} = require("@discordjs/builders")

module.exports = {
	name: "remind",
	aliases: ["remindme"],
	description: "Ställ in en påminnelse! Tid anges såhär: 7d, 24h, 5m etc.",
	usage: ["remind <time> <message>"],
	perms: [],
	data: new SlashCommandBuilder()
		.setName("remind")
		.setDescription("Ställ in en påminnelse! Tid anges såhär: 7d, 24h, 5m etc.")
		.addStringOption((option=>{
			return option.setName("time").setDescription("Ge tiden som du vill ska ta, Som 7d, 5m, 10h").setRequired(true)
		}))
		.addStringOption((option=>{
			return option.setName("medelande").setDescription("Medelandet du vill spara").setRequired(true)
		})),
	async do(message, args, profileData,isInteraction) {
		if (!args[0] && !isInteraction) return message.channel.send("Du måste sätta en tid för påminnelsen!");
		if(isInteraction){
			args[0] = message.options._hoistedOptions[0].value;
			args[1] = message.options._hoistedOptions[1].value
		}
		let timeout = 0;
		let array = args[0].split("-");
		array.forEach(element => {
			if (ms(element) == undefined){
				if(!isInteraction) return message.channel.send("Tiden måste kunna omvandlas till millisekunder!");
				else message.reply("Tiden måste kunna omvandlas till millisekunder!")
			} 
			timeout += ms(element);
		});

		//Determine if user specified a message or not
		let msg;
		if (args[1]) {
			msg = args.splice(1).join(" ");
		} else {
			msg = "Inget meddelande angivet."
		}

		//Add reminder to database
		let remindTimestamp = Date.now() + timeout;
		let remindTime = new Date(remindTimestamp);
		profileData.reminders.push({
			remindTimestamp: remindTimestamp,
			message: msg
		});
		await profileData.save();

		if(!isInteraction) message.channel.send(`Jag påminner dig om \`${ms(timeout)}\` eller \`${remindTime}\``);
		else message.reply(`Jag påminner dig om \`${ms(timeout)}\` eller \`${remindTime}\``)

		setTimeout(() => {
			const embed = new Discord.MessageEmbed()
				.setColor("#f54242")
				.setTitle(`Påminnelse`)
				.setDescription(msg)
			message.member.send({embeds:[embed]})
		}, timeout)
	}
}