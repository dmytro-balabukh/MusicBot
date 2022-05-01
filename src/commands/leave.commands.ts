import { getVoiceConnection, VoiceConnection } from "@discordjs/voice";
import { Message } from "discord.js";
import { injectable } from "inversify";
import { ICommand } from "../interfaces/command.interface";
import { Bot } from "../types/bot.type";
import MusicSubscription from "../types/music-subscription.type";

@injectable()
export default class LeaveCommand implements ICommand {
    name: string = 'leave';

    execute(message: Message<boolean>, args?: string): void {
        const guildId: string = message.guildId as string;
        let subscription: MusicSubscription = Bot.subscriptions.get(guildId) as MusicSubscription;
        if(!subscription){
            message.reply('Bot is not present in the voice channel for the moment.').then((message) => {
                message.react('❌');
            });
            return;
        }
        subscription.voiceConnection.destroy();
        Bot.subscriptions.delete(guildId);
    }
}