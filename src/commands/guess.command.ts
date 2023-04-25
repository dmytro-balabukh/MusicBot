import { GuildMember, Message, TextChannel, Util, VoiceChannel } from "discord.js"
import { ICommand } from "../interfaces/command.interface";
import { inject, injectable } from "inversify";
import YouTube from "discord-youtube-api";
import { TYPES } from "../configs/types.config";
import { BotService } from "../services/bot.service";
import MusicSubscriptionService from "../services/music-subscription.service";
import TrackService from "../services/track.service";
import YoutubeService from "../services/youtube/youtube.service";
import YoutubeSearchQuery from "../services/youtube/models/youtube-search-query.model";
import YoutubeSearchResult from "../services/youtube/models/youtube-search-result.model";
import Utils from "../helpers/utils";

@injectable()
export default class GuessCommand implements ICommand {
    public name: string = 'guess';
    @inject(TYPES.YoutubeService) private youtubeService: YoutubeService;

    // TODO: Add error mesage if bot is playing
    async execute(message: Message, args: string): Promise<void> {
        try {
            if (!this.validateRequest(message, args)) {
                return;
            }
            const sender: GuildMember = message.member as GuildMember;
            let options: YoutubeSearchResult[] = await this.youtubeService.getRandomYoutubeOptions();
            let songToGuess: YoutubeSearchResult = options[Utils.getIndexOfRandomValue(options.length)];

            let subscription: MusicSubscriptionService = BotService.subscriptions.get(sender.guild.id) as MusicSubscriptionService;
            if(!subscription){
                subscription = new MusicSubscriptionService(message.channel as TextChannel, sender.voice.channelId);
                BotService.subscriptions.set(sender.guild.id, subscription);
            }

            let track: TrackService = new TrackService(songToGuess.title, songToGuess.url);
            subscription.audioPlayerService.guess(track, options);
            
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
        return true;
    }
}