import { Message } from "discord.js";
import { injectable } from "inversify";
import { ICommand } from "../interfaces/command.interface";
import { Bot } from "../types/bot.type";
import MusicSubscription from "../types/music-subscription.type";

@injectable()
export default class QueueCommand implements ICommand {
    name: string = 'queue';

    execute(message: Message<boolean>, args?: string): void {
        if(args.length !== 0) {
            return;
        }
        let subscription: MusicSubscription = Bot.subscriptions.get(message.guildId);
        if(!subscription){
            message.reply('Bot is not present in the voice channel for the moment.').then((message) => {
                message.react('❌');
            });
            return;
        }
        let outputMessage: string = 'QUEUE\n\n';
        subscription.queue.getTracksNames()
            .forEach((trackName: string, index: number) => {
                outputMessage += `${index + 1}. ${trackName}\n`;
            });
        message.channel.send(outputMessage);
    }
}