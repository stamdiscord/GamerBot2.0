const functions = require("../functions")
const discord  = require("discord.js");

module.exports = {
	name: "setframe",
	aliases: ["setram","ram","frame"],
	description: "Med deta kommand så kan du ändra din ram",
	usage: [],
	perms: [],
	async do(message, args, profileData) {
		let frames = [//https://imgur.com/a/gfa7osM 
			"https://i.imgur.com/zVxJiz4.png", //orginal
			"https://i.imgur.com/fI1bZ3W.png", //Vrile64
			"https://i.imgur.com/Gwtlbi8.png",//arre
			"https://i.imgur.com/WpjMGG0.png", //snizard
			"https://i.imgur.com/6qMlNKs.png", //lukasabbe
			"https://i.imgur.com/cYBWxKF.png",//Renen
			"https://i.imgur.com/j9nCDqr.png",//snizard
			"https://i.imgur.com/CQyzVpV.png",//snizard
			"https://i.imgur.com/pUTFUAM.png",//snizard
			"https://i.imgur.com/VvUSM3M.png"//pixi
		]//the frames. It needs to be a link so they are upploaded to imgur.
		let index = 0; //local index
		let TimeOut, Xp, xpPercentage = 0;
		let embed = new discord.MessageEmbed()
			.setTitle("För att välja ram trycker du på ⏺️")
			.setImage(frames[index])
			.setAuthor(message.member.user.username)
			.setFooter(`${index +1}/${frames.length}`)
		const row = new discord.MessageActionRow()
			.addComponents(
				[
					new discord.MessageButton()
						.setStyle("SECONDARY")
						.setEmoji("◀️")
						.setCustomId("left"),
					new discord.MessageButton()
						.setStyle("SECONDARY")
						.setEmoji("⏺️")
						.setCustomId("pick"),
					new discord.MessageButton()
						.setStyle("SECONDARY")
						.setEmoji("▶️")
						.setCustomId("right"),
				]
			);
		var Photo = await message.channel.send({embeds:[embed], components:[row] })
		let filter = data =>{ 
			return data;
		}
		const collector = Photo.createMessageComponentCollector(filter,{ dispose: true });
		collector.on("collect",async data=>{
			if(data.user.id != message.member.id) return;
			data.deferUpdate()
			if(data.customId == "left" && index != 0){
				index--;
			}
			if(data.customId == "right" && index != frames.length -1){
				index++;
			}
			let embed = new discord.MessageEmbed()
				.setTitle("För att välja ram trycket du på ⏺️")
				.setImage(frames[index])
				.setAuthor(message.member.user.username)
				.setFooter(`${index+1}/${frames.length}`)
			Photo.edit({embeds:[embed]})
			if(data.customId == "pick"){
				profileData.profileFrame = index;
				profileData.save();
				await row.components.map(e => e.setDisabled(true))
				collector.stop();
				let embed = new discord.MessageEmbed()
					.setTitle("Du har nu ändradt din ram")
					.setAuthor(message.member.user.username)
				Photo.edit({embeds:[embed] , components:[row]});
				Photo.reactions.removeAll()
			}
		})
	}
}
