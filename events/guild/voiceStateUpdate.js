module.exports = async (oldMember, newMember) => {
	let newUserChannel = client.guilds.cache.get(newMember.guild.id).channels.cache.get(newMember.channelID);
	let oldUserChannel = client.guilds.cache.get(oldMember.guild.id).channels.cache.get(oldMember.channelID);

	if (oldUserChannel === undefined && newUserChannel) {				//Someone joined a voicechannel
		require("../custom/voiceJoin")(oldMember, newMember);

	} else if (newUserChannel === undefined && oldUserChannel) {		//Someone left a voice channel
		require("../custom/voiceLeave")(oldMember, newMember);

	} else if (oldUserChannel && newUserChannel) {						//Someone switched to another voice channel
		require("../custom/voiceSwitch")(oldMember, newMember);
	}
}