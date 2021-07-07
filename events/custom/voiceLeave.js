const profileModel = require("../../models/profileSchema");

module.exports = async (oldMember, newMember) => {
	let profileData = await profileModel.fetchProfile(oldMember.id);						//Fetch profile

	if (oldMember.channelID === profileData.privateVoiceID) {								//If the user was in a private VC belonging to them, delete the channel
		oldMember.guild.channels.cache.get(profileData.privateVoiceID).delete();
		profileData.privateVoiceID = "";
		profileData.save();
	}
}