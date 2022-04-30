import { Client, GuildMember, Message, VoiceChannel } from "discord.js"
import { ICommand } from "../interfaces/command.interface";
import { injectable } from "inversify";
import YouTube from "discord-youtube-api";
import container from "../configs/inversify.config";
import { TYPES } from "../configs/types.config";
import { Bot } from "../types/bot.type";
import MusicSubscription from "../types/music-subscription.type";
import Track from "../types/track.type";

@injectable()
export default class PlayCommand implements ICommand {
    name: string = 'play';
    async execute(message: Message, args: string): Promise<void> {
        try {
            const sender: GuildMember = message.member as GuildMember;
            if (!this.validateRequest(message, args)) {
                return;
            }
            let subscription: MusicSubscription = Bot.subscriptions.get(sender.guild.id) as MusicSubscription;
            const youtubeClient: YouTube = container.get<YouTube>(TYPES.Youtube);
            const song = await youtubeClient.searchVideos(args);
            
            if(!subscription){
                subscription = new MusicSubscription(sender);
                Bot.subscriptions.set(sender.guild.id, subscription);
            }
    
            let track: Track = new Track(song.title, song.url);
            subscription.addTrack(track);
    
            message.reply(`> \`${song.title}\` **has been added to the queue.**`)
                .then((message: Message) => message.react('✅'));
                
        } catch (error) {
            console.error(error);
        }
    }

    validateRequest(message: Message, args: string) {
        const sender: GuildMember = message.member as GuildMember;
        const memberChannel = sender.voice.channel as VoiceChannel;

        if (!memberChannel || !memberChannel.speakable ||
            !memberChannel.joinable || !args) {
            return false;
        }
        if (message.client.voice.adapters.size === 0 && memberChannel.full) {
            return false;
        }
        if (message.client.voice.adapters.size === 1 &&
            (!memberChannel.members.some((val: GuildMember) => val.user.bot))) {
            return false;
        }
        return true;
    }

    memberAndBotInTheSameVoiceChannel
        (channel: VoiceChannel, client: Client): boolean {
        return (client.voice.adapters.size === 1 &&
            !channel.members.some((val: GuildMember) => val.user.bot));
    }
}