import { Message, TextChannel } from "discord.js";
import { inject, injectable } from "inversify";
import { TYPES } from "../configs/types.config";
import MessageHandler from "../handlers/message.handler";
import { ICommand } from "../interfaces/command.interface";
import { Bot } from "../types/bot.type";
import { CasualMessage } from "../types/message/models/casual-message.type";
import { DeclineMessage } from "../types/message/models/declined-message.type";
import { CasualMessageStrategy } from "../types/message/strategies/casual-message-strategy.type";
import { EmphasizedMessageStrategy } from "../types/message/strategies/emphasized-message-strategy.type";
import MusicSubscription from "../types/music-subscription.type";

@injectable()
export default class QueueCommand implements ICommand {
    name: string = 'queue';
    @inject(TYPES.MessageHandler) private messageHandler: MessageHandler;

    execute(message: Message, args?: string): void {
        if(args.length !== 0) {
            return;
        }
        this.messageHandler.setChannel(message.channel as TextChannel);
        this.messageHandler.setStrategy(new EmphasizedMessageStrategy());
        let subscription: MusicSubscription = Bot.subscriptions.get(message.guildId);
        if(!subscription){
            this.messageHandler.send(new DeclineMessage('Bot is not in the channel for the moment.'));
            return;
        }

        let trackNames: string[] = subscription.queueHandler.getTracksNames();
        if(!trackNames){
            this.messageHandler.send(new DeclineMessage('Queue is empty.'));
            return;
        }
        let outputMessage: string = '> **Queue**\n\n';
        trackNames.forEach((trackName: string, index: number) => {
            outputMessage += `${index + 1}. ${trackName}\n`;
        });
        this.messageHandler.setStrategy(new CasualMessageStrategy());
        this.messageHandler.send(new CasualMessage(outputMessage));
    }
}