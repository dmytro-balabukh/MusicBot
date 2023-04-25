import { Message } from "discord.js";
import { injectable } from "inversify";
import { ICommand } from "../interfaces/command.interface";
import { BotService } from "../services/bot.service";
import MusicSubscriptionService from "../services/music-subscription.service";
import { Reactions } from "../helpers/constants";
import TrackService from "../services/track.service";
import { AudioEffect } from "../enums/audio-effect.enum";
import Utils from "../helpers/utils";

@injectable()
export default class QueueCommand implements ICommand {
    name: string = 'queue';

    execute(message: Message, args?: string): void {
        if(args.length !== 0) {
            return;
        }
        let subscription: MusicSubscriptionService = BotService.subscriptions.get(message.guildId);
        if(!subscription){
            message.channel.send('Bot is not in the channel for the moment.').then(Reactions.reactDecline);
            return;
        }

        let trackNames: TrackService[] = subscription.audioPlayerService.queueHandler.getTracks();
        if(!trackNames){
            message.channel.send('Queue is empty.').then(Reactions.reactDecline);
            return;
        }
        let outputMessage: string = '> **Queue**\n\n';
        trackNames.forEach((track: TrackService, index: number) => {
            outputMessage += `${index + 1}. ${track.name} | Effect: ${Utils.getEnumKeyByEnumValue(AudioEffect, track.audioEffect)?? 'Global'}\n`;
        });
        message.channel.send(outputMessage);
    }
}