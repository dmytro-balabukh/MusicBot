import { GuildMember, Message, VoiceChannel } from "discord.js";
import { injectable } from "inversify";
import { ICommand } from "../interfaces/command.interface";
import { BotService } from "../services/bot.service";
import MusicSubscriptionService from "../services/music-subscription.service";

@injectable()
export default class ContinueCommand implements ICommand {
    name: string = 'continue';
    execute(message: Message<boolean>): void {
        try {
            let subscription: MusicSubscriptionService = BotService.subscriptions.get(message.guildId);
            if(!subscription || !this.validateRequest(message)) {
                return;
            }
            subscription.audioPlayerService.continue();
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