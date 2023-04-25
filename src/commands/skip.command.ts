import { GuildMember, Message, TextChannel, VoiceChannel } from "discord.js"
import { inject, injectable } from "inversify";

import container from "../configs/inversify.config";
import { TYPES } from "../configs/types.config";
import MessageHandler from "../handlers/message.handler";
import { ICommand } from "../interfaces/command.interface";
import { Bot } from "../types/bot.type";
import { DeclineMessage } from "../types/message/models/declined-message.type";
import { EmphasizedMessageStrategy } from "../types/message/strategies/emphasized-message-strategy.type";
import MusicSubscription from "../types/music-subscription.type";

@injectable()
export default class SkipCommand implements ICommand {
    name: string = 'skip';
    @inject(TYPES.MessageHandler) private messageHandler: MessageHandler;

    execute(message: Message, args?: string): void {
        try {
            let subscription: MusicSubscription = Bot.subscriptions.get(message.guildId);
            if(!subscription || !this.validateRequest(message, args)) {
                this.messageHandler = container.get<MessageHandler>(TYPES.MessageHandler);
                this.messageHandler.setStrategy(new EmphasizedMessageStrategy());
                this.messageHandler.send(new DeclineMessage('Unable to skip.'));
                return;
            }
            subscription.skip();
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