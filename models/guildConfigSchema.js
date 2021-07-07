const mongoose = require("mongoose");

const guildConfigSchema = new mongoose.Schema({
	guildID: { type: String, require: true, unique: true },
	privateVoiceChannel: { type: String, default: "" }
});

const model = mongoose.model("GuildConfig", guildConfigSchema);

const fetchGuildConfig = async (guildID) => {
	let data = await model.findOne({ guildID: guildID });
	if (!data) {
		data = await model.create({
			guildID: guildID
		});
		await data.save();
	}
	return data;
};

module.exports = { guildConfig: model, fetchGuildConfig };