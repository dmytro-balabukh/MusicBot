import { GuildMember, Message, TextChannel, VoiceChannel } from "discord.js"
import { ICommand } from "../interfaces/command.interface";
import { injectable } from "inversify";
import { BotService } from "../services/bot.service";
import MusicSubscriptionService from "../services/music-subscription.service";
import { AudioEffect } from "../enums/audio-effect.enum";
import { MessageEphasis } from "../enums/message-emphasis.enum";
import { Reactions } from "../helpers/constants";

@injectable()
export default class EffectCommand implements ICommand {
    public name: string = 'effect';
   

    // TODO: Add error mesage if bot is playing
    async execute(message: Message, args: string): Promise<void> {
        try {
            if (!this.validateRequest(message, args)) {
                return;
            }
            const sender: GuildMember = message.member as GuildMember;

            let subscription: MusicSubscriptionService = BotService.subscriptions.get(sender.guild.id) as MusicSubscriptionService;
            if(!subscription){
                subscription = new MusicSubscriptionService(message.channel as TextChannel, sender.voice.channelId);
                BotService.subscriptions.set(sender.guild.id, subscription);
            }

            let effectString: string = args.split(' ')[0];
            let audioEffect: AudioEffect = this.matchAudioEffect(effectString);
            
            if(audioEffect) {
                subscription.audioPlayerService.audioEffect = audioEffect;
            }
        } catch (error) {
            console.error(error);
        }
    }

    validateRequest(message: Message, args: string) {
        const sender: GuildMember = message.member as GuildMember;
        const memberChannel = sender.voice.channel as VoiceChannel;

        if (!memberChannel || !memberChannel.speakable ||
            !memberChannel.joinable) {
            return false;
        }
        if (message.client.voice.adapters.size === 0 && memberChannel.full) {
            return false;
        }
        if (message.client.voice.adapters.size === 1 &&
            (!memberChannel.members.some((val: GuildMember) => val.user.bot))) {
            return false;
        }

        let splitArgs = args.split(' ');
        if(splitArgs.length != 1) {
            // Can't set multiple effects for now.
            message.channel.send("Incorrect global effect param setting. See !help").then(Reactions.reactDecline);
            return false;
        }

        return true;
    }
    
    private matchAudioEffect(enumString: string): AudioEffect | undefined {
        for (const key in AudioEffect) {
            if (key.toLowerCase() === enumString.toLowerCase()) {
              return AudioEffect[key];
          }
        }
        return undefined;
      }
}