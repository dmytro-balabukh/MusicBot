import { GuildMember, Message, TextChannel, VoiceChannel } from "discord.js"
import { inject, injectable } from "inversify";

import container from "../configs/inversify.config";
import { TYPES } from "../configs/types.config";
import { ICommand } from "../interfaces/command.interface";
import { BotService } from "../services/bot.service";
import MusicSubscriptionService from "../services/music-subscription.service";
import { Reactions } from "../helpers/constants";

@injectable()
export default class SkipCommand implements ICommand {
    name: string = 'skip';

    execute(message: Message, args?: string): void {
        try {
            let subscription: MusicSubscriptionService = BotService.subscriptions.get(message.guildId);
            if(!subscription || !this.validateRequest(message, args)) {
                message.channel.send('Unable to skip.').then(Reactions.reactDecline);
                return;
            }
            subscription.audioPlayerService.skip();
        } catch (error) {
            console.log(error);
        }
    }

    validateRequest(message: Message, args?: string) {
        const sender: GuildMember = message.member as GuildMember;
        const senderChannel = sender.voice.channel as VoiceChannel;

        // If sender is not in the voice channel.
        if (!senderChannel || args) {
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