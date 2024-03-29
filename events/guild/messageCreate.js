const functions = require("../../functions");
const profileModel = require("../../models/profileSchema");
const configModel = require("../../models/configSchema");
const roleModel = require("../../models/roleSchema");
const cardCounter = require("../custom/CardCounter");
const ms = require('ms');

module.exports = async (message, client) => {
        if (message.author.bot) return;
        if (message.channel.type == "DM") return;
        //Remove links
        await functions.checkForLinks(message);

        //Retreive options
        let configData = await configModel.fetchConfig(process.env.config_id);          //Retreive options

        //Count message card for counter!
        //cardCounter.countMessage(message);

        const prefix = configData.prefix;
        const args = message.content.slice(prefix.length).split(/ +/);
        const cmd = args.shift().toLowerCase();

        if (configData.debug && (client.commands.get(cmd) || client.commands.find(a => a.aliases && a.aliases.includes(cmd)))) {
                try {
                        delete require.cache[require.resolve(`../../commands/${cmd}.js`)];
                        client.commands.delete(cmd);
                        const pull = require(`../../commands/${cmd}.js`);
                        client.commands.set(cmd, pull);
                } catch (err) {
                        //console.log(err); Tog bort error här för det kommer spamma consolen när folk använder alias
                }
        }

        const command = client.commands.get(cmd) || client.commands.find(a => a.aliases && a.aliases.includes(cmd));
        const mention_command = client.mention_commands.find(object => message.content && object.permittedMessages.some(element => message.content.toLowerCase().includes(element)));
        const question_command = client.question_commands.find(object => message.content && object.permittedMessages.some(element => message.content.toLowerCase().replace(/\s/g, "").includes(element)));
        const channel_action = client.channel_actions.find(object => object.channels.includes(message.channel.id));

        let profileData = await profileModel.fetchProfileFromMessage(message);          //Fetch profile



        if ((command && message.content.startsWith(prefix)) && configData.PrefixCommands == true) {
                if (command.perms.includes("adminCmd")) {
                        if (message.member.permissions.has("ADMINISTRATOR")) {
                                try {
                                        await command.do(message, args, profileData);
                                } catch (err) {
                                        console.log(err);
                                        message.channel.send("Det har inträffat ett fel med det här kommandot. Se konsolen för mer information!")
                                }
                        } else {
                                message.channel.send("Du har inte tillåtelse att använda det här kommandot!");
                        }
                }
                else if (command.perms.includes("trustedCmd")) {
                        if (profileData.level >= 11 || message.member.permissions.has("ADMINISTRATOR")) {
                                command.do(message, args, profileData)
                        }
                        else {
                                message.channel.send("Du har inte tillåtelse att exekvera det här kommandot!");
                        }
                }
                else {
                        try {
                                await command.do(message, args, profileData);
                        } catch (err) {
                                console.log(err);
                                message.channel.send("Det har inträffat ett fel med det här kommandot. Se konsolen för mer information!")
                        }
                }
        } else if (mention_command && functions.checkIfMentioned(message)) {
                if (mention_command.perms.includes("adminCmd")) {
                        if (message.member.permissions.has("ADMINISTRATOR")) {
                                mention_command.do(message, args, profileData);
                        } else {
                                message.channel.send("Du har inte tillåtelse att exekvera det här kommandot!");
                        }

                }
                else if (mention_command.perms.includes("trustedCmd")) {
                        if (profileData.level >= 11 || message.member.permissions.has("ADMINISTRATOR")) {
                                mention_command.do(message, args, profileData);
                        } else {
                                message.channel.send("Du har inte tillåtelse att exekvera det här kommandot!");
                        }
                }
                else {
                        mention_command.do(message, args, profileData);
                }
        } else if (question_command) {
                if (question_command.perms.includes("adminCmd")) {
                        if (message.member.permissions.has("ADMINISTRATOR")) {
                                question_command.do(message, args, profileData);
                        } else {
                                message.channel.send("Du har inte tillåtelse att exekvera det här kommandot!");
                        }

                }
                else if (question_command.perms.includes("trustedCmd")) {
                        if (profileData.level >= 11 || message.member.permissions.has("ADMINISTRATOR")) {
                                question_command.do(message, args, profileData)
                        }
                        else {
                                message.channel.send("Du har inte tillåtelse att exekvera det här kommandot!");
                        }
                }
                else {
                        question_command.do(message, args, profileData);
                }
        } else {
                //Removes messages in Help
                if (message.channel.id == "834118959053275176") {
                        message.delete();
                }
                if(message.channel.type == "GUILD_PUBLIC_THREAD" || message.channel.type == "GUILD_PRIVATE_THREAD") return;
                if (message.createdTimestamp - profileData.lastMessageTimestamp > ms("1w")) {
                        let days = Math.floor((message.createdTimestamp - profileData.lastMessageTimestamp) / 1000 / 86400);
                        let penalty = days * 2;
                        if (penalty > profileData.xp) {
                                profileData.xp = 0;
                        } else {
                                profileData.xp -= penalty;
                        }
                }
                profileData.lastMessageTimestamp = message.createdTimestamp;
                if ((profileData.xpTimeoutUntil - message.createdTimestamp < 0) || (!configData.xp.timeoutsEnabled)) {
                        const xpAmount = Math.floor(Math.random() * 3) + 1;
                        let array = [];
                        array.push(xpAmount) //This is used for when there isn't any xpboost that should be applied for this user.

                        //Profile XP boost
                        if ((profileData.xpboost.stopBoostTimestamp - message.createdTimestamp > 0) || profileData.xpboost.stopBoostTimestamp === -1) {
                                array.push(xpAmount * profileData.xpboost.multiplier);
                        }

                        //Role XP boost
                        const roles = message.member.roles.cache.map(role => role);
                        for (const role of roles) {
                                roleData = await roleModel.fetchRole(role.id);
                                if ((roleData.xpboost.stopBoostTimestamp - message.createdTimestamp > 0) || roleData.xpboost.stopBoostTimestamp === -1) {
                                        array.push(xpAmount * roleData.xpboost.multiplier);
                                }
                        }

                        profileData.xp += Math.max(...array);           //Use the highest xpboost

                        profileData.xpTimeoutUntil = message.createdTimestamp + 300000 * xpAmount + functions.getRandomIntRange(-100000, 100000);
                        if (profileData.xp >= Math.pow(profileData.level + configData.xp.levelBaseOffset, configData.xp.levelExponent) || (profileData.level > 30 && profileData.xp > 999)) {
                                profileData.level++;

                                //Adding new roles if required

                                if (!configData.xp.levels.length) {
                                        console.log("There are no roles in the database for the user to get");
                                }
                                //Removing old roles
                                configData.xp.levels.forEach(element => {               //Remove all level roles
                                        for (let id_index = 0; id_index < element.id.length; id_index++) {
                                                message.member.roles.remove(message.guild.roles.cache.get(element.id[id_index]), ["Test removed role. To later add a new or add back the old one"]);
                                        }
                                });
                                //Adding find correct role
                                for (let index = 0; index < configData.xp.levels.length; index++) {
                                        const role = configData.xp.levels[index];

                                        //nextRoleLevel allows for testing within span, and if statement helps in end of list.
                                        let nextRoleLevel = 0;
                                        if (index === configData.xp.levels.length - 1) {
                                                nextRoleLevel = 10000000;
                                        } else {
                                                nextRoleLevel = configData.xp.levels[index + 1].level;
                                        }
                                        //Actually adding roles
                                        if (profileData.level >= role.level + 1 && profileData.level < nextRoleLevel + 1) {
                                                for (let id_index = 0; id_index < role.id.length; id_index++) {
                                                        message.member.roles.add(message.guild.roles.cache.get(role.id[id_index]), ["New or old role added!"]);
                                                }
                                        }
                                }

                                profileData.xp = 0;
                                message.member.send(`Du levlade som faan till level \`${profileData.level - 1}\` i Stamsites gaming community. Grattis!`)
                                        .catch(console.error); // User has closed DMs for the server. Catch prevents crashes due to unkept promises.
                        }
                }
                await profileData.save();
        }

        if (channel_action) {
                channel_action.do(message, profileData);
        }

        if (message.content.toLowerCase().includes("christerpog") || message.content.toLowerCase().includes("cristerpog")) {
                if (message.channel.id == "809483972282810390" || message.channel.id == "780765093343395880" || message.channel.id == "810221092878680124") {
                        message.react("810255466952917052")
                        message.channel.send("<:mello_ChristerPOG:810255466952917052>")
                }
        }
}
