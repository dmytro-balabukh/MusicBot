import { GuildMember, Message, VoiceChannel } from "discord.js";
import { injectable } from "inversify";
import { ICommand } from "../interfaces/command.interface";
import { Bot } from "../types/bot.type";
import MusicSubscription from "../types/music-subscription.type";

@injectable()
export default class SkipCommand implements ICommand {
    name: string = 'skip';
    execute(message: Message<boolean>): void {
        try {
            let subscription: MusicSubscription = Bot.subscriptions.get(message.guildId);
            if(!subscription || !this.validateRequest(message)) {
                return;
            }
            subscription.skip();
        } catch (error) {
            console.log(error);
        }
    }

    validateRequest(message: Message) {
        const sender: GuildMember = message.member as GuildMember;
        const senderChannel = sender.voice.channel as VoiceChannel;

        // If sender is not in the voice channel.
        if (!senderChannel) {
            return false;
        }

        // If sender is in the channel, but not one that bot is in.
        if (message.client.voice.adapters.size === 1 &&
            (!senderChannel.members.some((val: GuildMember) => val.user.bot))) {
            return false;
        }
        return true;
    }
}