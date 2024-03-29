const profileModel = require("../models/profileSchema");
const ms = require("ms");
const Discord = require('discord.js');
const configModel = require("../models/configSchema");
const { SlashCommandBuilder } = require("@discordjs/builders")

module.exports = {
        name: "setxp",
        aliases: [],
        description: "Sätt xp, xp timeout eller level för en användare!",
        usage: [
                "setxp {<mentionedUser>|<userID>} -x <xpAmount>",
                "setxp {<mentionedUser>|<userID>} -t <xpTimeout>",
                "setxp {<mentionedUser>|<userID>} -l <level>"
        ],
        notes: [
                "*xpTimeout* mäts som standard i millisekunder från att du skickar detta kommando. Du kan också specificera värdet genom att sätta \`h\`, \`s\`, \`m\` etc. bakom. Exempel:\n\`60s\`, \`8h\` och \`2w\`"
        ],
        perms: ["adminCmd"],
        data: new SlashCommandBuilder()
                .setName("setxp")
                .setDescription("Sätt xp, xp timeout eller level för en användare!")
                .addUserOption((option) => {
                        return option.setName("user").setDescription("användaren som du vill sätt xp på").setRequired(true)
                })
                .addStringOption((option) => {
                        return option.setName("option").setDescription("sätt en av dessa: -x -t -l").setRequired(true).addChoice("xp", "-x").addChoice("timeout", "-t").addChoice("level", "-l")
                })
                .addIntegerOption((option) => {
                        return option.setName("value").setDescription("Du skriver nummret du vill ändra till").setRequired(true)
                }),
        async do(message, args, profileData, isInteraction) {

                //Retreive options
                let configData = await configModel.fetchConfig(process.env.config_id);          //Retreive options

                let member;
                let user;
                if (!args[0]) {
                        if (isInteraction) {
                                member = message.options._hoistedOptions[0].member
                        }
                        else return message.channel.send("Du måste ange vilken användare du vill sätta xp'n för.");
                } else {
                        if (message.mentions.members.first()) {
                                member = message.mentions.members.first();
                                user = message.mentions.users.first();
                        } else {
                                member = await message.guild.members.fetch(args[0]);
                                user = await message.client.users.fetch(args[0]);
                        }
                }
                if (isInteraction) {
                        args[1] = message.options._hoistedOptions[1].value;
                        args[2] = message.options._hoistedOptions[2].value;
                }
                if (!args[1]) return message.channel.send("Du måste ange minst en operation du vill utföra!");
                let profile_data = await profileModel.fetchProfile(member.id, message.guild.id);                //Fetch profile
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
                                                value: `Sätt ${member}'s xp till ${profile_data.xp.toString()}!`
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
                                                value: `Sätt ${member}'s xp timeout till ${profile_data.xpTimeoutUntil.toString()}!`
                                        });
                                }
                                completedOperations.push("-t")
                                index++;
                        } else if (args[index] === "-l") {
                                if (completedOperations.includes("-l")) {
                                        index++;
                                        continue;
                                }
                                if (!args[index + 1]) return message.channel.send("Ett värde för leveln måste tillhandahållas.");
                                if (isNaN(args[index + 1])) {
                                        return message.channel.send("Leveln måste vara ett nummer!");
                                } else {
                                        profile_data.level = parseInt(args[index + 1]) + 1;

                                        //Update level
                                    configData.xp.levels.forEach(element => {           //Remove all level roles
                                        for (let id_index = 0; id_index < element.id.length; id_index++) {
                                            member.roles.remove(message.guild.roles.cache.get(element.id[id_index]));
                                        }
                                    });
                                        //Adding find correct role
                                    for (let index = 0; index < configData.xp.levels.length; index++) {
                                        const role = configData.xp.levels[index];
                                        //nextRoleLevel allows for testing within span, and if statement helps in end of list.
                                        let nextRoleLevel = 0;
                                        if (index === configData.xp.levels.length - 1) {
                                            nextRoleLevel = 100000000;
                                        } else {
                                            nextRoleLevel = configData.xp.levels[index + 1].level;
                                        }
                                        //Actually adding roles
                                        if (profile_data.level >= role.level + 1 && profile_data.level < nextRoleLevel + 1) {
                                            for (let id_index = 0; id_index < role.id.length; id_index++) {
                                                member.roles.add(message.guild.roles.cache.get(role.id[id_index]));
                                                if (!isInteraction) message.channel.send("Added role: " + message.guild.roles.cache.get(role.id[id_index]).name + ". To member: " + member.user.username);
                                                //else message.reply("Added role: " + message.guild.roles.cache.get(role.id[id_index]).name + ". To member: " + member.user.username);
                                            }
                                            if (isInteraction) message.editReply("Added roles to member: " + member.user.username);
                                        }
                                    }

                                        // member.roles.add(message.guild.roles.cache.get(configData.xp.levels[profile_data.level - 2])).catch((err) => {
                                        //      console.log(`Failed to add level role to user: ${member.user.tag}. He/She is at level ${profile_data.level - 1}`);
                                        //      console.log(`Errormessage: ${err}`);
                                        // });

                                        profile_data.xp = 0;
                                        fields.push({
                                                name: "Level",
                                                value: `Sätt ${member}'s level till ${(profile_data.level - 1).toString()}!`
                                        });
                                }
                                completedOperations.push("-l")
                                index++;
                        } else if (!completedOperations.includes(args[index])) {
                                completedOperations.push(args[index]);
                        }
                }
                for (let operation of completedOperations) {
                        if ((operation !== "-x") && (operation !== "-t") && (operation !== "-l")) {
                                return message.channel.send(`Du specificerade operationen ${operation} som inte finns. Använd help-kommandot för att se användningen av det här kommandot samt de tillgängliga operationerna.`);
                        }
                }
                await profile_data.save()

                const embed = new Discord.MessageEmbed()
                        .setColor("#f54242")
                        .setTitle(`Set xp`)
                        .addFields(
                                fields
                        )
                if (!isInteraction) message.channel.send({ embeds: [embed] });
                else message.editReply({ embeds: [embed] });
        }
}
