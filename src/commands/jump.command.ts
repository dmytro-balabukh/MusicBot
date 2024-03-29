import { GuildMember, Message, VoiceChannel } from "discord.js";
import { injectable } from "inversify";
import { ICommand } from "../interfaces/command.interface";
import { Bot } from "../types/bot.type";
import MusicSubscription from "../types/music-subscription.type";

@injectable()
export default class JumpCommand implements ICommand {
    name: string = 'jump';

    execute(message: Message<boolean>, args?: string): void {
        try {
            let subscription: MusicSubscription = Bot.subscriptions.get(message.guildId);
            // Add validation
            if(!subscription || !this.validateRequest(message, args)) {
                return;
            }
    
            // Consider move subscriptions to communication.event.ts, because you call it almost everywhere
            let indexToJump: number = Number(args) - 1;
            if(indexToJump === null || indexToJump === undefined || isNaN(indexToJump)){
                message.channel.send('Unable to jump to the specified index.').then((message) => {
                    message.react('❌');
                });
                return;
            }
            subscription.jump(indexToJump);
        } catch (error) {
            console.log(error);            
        }
    }

    // TODO: This validation doesn't fit there.
    validateRequest(message: Message, args: string): boolean {
        const sender: GuildMember = message.member as GuildMember;
        const memberChannel = sender.voice.channel as VoiceChannel;

        // If sender is in the channel and this channel is speakable,
        // and you can join it and args(like 1,2,3 ) are provided.
        if (!memberChannel || !memberChannel.speakable ||
            !memberChannel.joinable || !args || args.length > 1) {
            return false;
        }
        
        //If bot is not in the channel, but sender is in full channel.
        if (message.client.voice.adapters.size === 0 && memberChannel.full) {
            return false;
        }
        
        // If bot is already in the channel and this channel is not the same
        // as senders. 
        if (message.client.voice.adapters.size === 1 &&
            (!memberChannel.members.some((val: GuildMember) => val.user.bot))) {
            return false;
        }
        return true;
    }

}