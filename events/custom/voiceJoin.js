const guildConfig = require("../../models/guildConfigSchema");
const profileModel = require("../../models/profileSchema");

module.exports = async (oldMember, newMember) => {
	let guildConfigData = await guildConfig.fetchGuildConfig(newMember.guild.id);			//Retreive guild config
	let profileData = await profileModel.fetchProfile(newMember.id);						//Fetch profile

	let member = client.guilds.cache.get(newMember.guild.id).members.cache.get(newMember.id);

	if (newMember.channelID === guildConfigData.privateVoiceChannel) {						//Create private voice if ids match
		const channel = await newMember.guild.channels.create(`Privat VC - ${member.user.tag}`, {
			type: "voice"
		});
		profileData.privateVoiceID = channel.id;		//Register channel id in user's profile
		profileData.save();

		member.voice.setChannel(channel);				//Move user into the newly created voicechat
	}
}