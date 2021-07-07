module.exports = async (oldMember, newMember) => {
	let newUserChannel = client.guilds.cache.get(newMember.guild.id).channels.cache.get(newMember.channelID);
	let oldUserChannel = client.guilds.cache.get(oldMember.guild.id).channels.cache.get(oldMember.channelID);

	if (oldUserChannel === undefined && newUserChannel) {

		// User Joins a voice channel
		require("../custom/voiceJoin")(oldMember, newMember);

	} else if (newUserChannel === undefined) {

		// User leaves a voice channel
		require("../custom/voiceLeave")(oldMember, newMember);

	}
}