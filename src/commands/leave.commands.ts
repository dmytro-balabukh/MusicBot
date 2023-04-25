import { getVoiceConnection, VoiceConnection } from "@discordjs/voice";
import { Message } from "discord.js";
import { injectable } from "inversify";
import { ICommand } from "../interfaces/command.interface";
import { BotService } from "../services/bot.service";
import MusicSubscriptionService from "../services/music-subscription.service";

@injectable()
export default class LeaveCommand implements ICommand {
    name: string = 'leave';

    execute(message: Message<boolean>): void {
        try {
            const guildId: string = message.guildId as string;
            let subscription: MusicSubscriptionService = BotService.subscriptions.get(guildId) as MusicSubscriptionService;
            if(!subscription){
                message.reply('Bot is not present in the voice channel for the moment.').then((message: Message) => {
                    message.react('❌');
                });
                return;
            }
            subscription.voiceConnectionService.voiceConnection.destroy();
            BotService.subscriptions.delete(guildId);
        } catch (error) {
            console.log(error);
        }
    }
}