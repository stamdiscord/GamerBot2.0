const {SlashCommandBuilder} = require("@discordjs/builders");
const { MessageActionRow, MessageButton } = require("discord.js");
module.exports = {
	name: "sendmessage",
	aliases: [],
	description: "Sends messages as bot",
	usage: [],
	perms: ["adminCmd"],
	data: new SlashCommandBuilder()
		.setName("sendmessage")
		.setDescription("Sends messages as bot")
        .addChannelOption((option)=>{
            return option.setName("channel").setDescription("channel to send to").setRequired(true)
        })
        .addStringOption((option)=>{
            return option.setName("message").setDescription("the thing you want to send").setRequired(true)
        })
        .addStringOption((option)=>{
            return option.setName("button").setDescription("if you want a button formtat like 'buttontext;customid'").setRequired(false);
        }),
	async do(message, args, profileData,isInteraction) {
        if(!isInteraction) return;
        let channel = message.options._hoistedOptions[0].channel;
        if(message.options._hoistedOptions[2] != undefined){
            const row = new MessageActionRow()
                .addComponents(
                    [
                        new MessageButton()
                            .setStyle("SECONDARY")
                            .setLabel(message.options._hoistedOptions[2].value.split(";")[0])
                            .setCustomId(message.options._hoistedOptions[2].value.split(";")[1])
                    ]
                );
            let mes = message.options._hoistedOptions[1].value;
            mes = await mes.replace(/-n-/g,"\n");
            channel.send({content:mes, components:[row]});
        }
        else {
            let mes = message.options._hoistedOptions[1].value;
            mes = await mes.replace(/-n-/g,"\n");
            channel.send(mes);
        }
        message.editReply("sent message");
	}
}