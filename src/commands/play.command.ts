import { GuildMember, Message, TextChannel, VoiceChannel } from "discord.js"
import { ICommand } from "../interfaces/command.interface";
import { inject, injectable } from "inversify";
import YouTube from "discord-youtube-api";
import { TYPES } from "../configs/types.config";
import { Bot } from "../types/bot.type";
import MusicSubscription from "../types/music-subscription.type";
import Track from "../types/track.type";

@injectable()
export default class PlayCommand implements ICommand {
    public name: string = 'play';
    @inject(TYPES.Youtube) private youtubeClient: YouTube;

    async execute(message: Message, args: string): Promise<void> {
        try {
            if (!this.validateRequest(message, args)) {
                return;
            }
            const sender: GuildMember = message.member as GuildMember;
            let subscription: MusicSubscription = Bot.subscriptions.get(sender.guild.id) as MusicSubscription;
            const song = await this.youtubeClient.searchVideos(args);
            
            if(!subscription){
                subscription = new MusicSubscription(message.channel as TextChannel, sender.voice.channelId);
                Bot.subscriptions.set(sender.guild.id, subscription);
            }
    
            let track: Track = new Track(song.title, song.url);
            subscription.play(track);
            
            //TODO: Move to MusicSubscription.
            message.reply(`> \`${song.title}\` **has been added to the queue**`)
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
}