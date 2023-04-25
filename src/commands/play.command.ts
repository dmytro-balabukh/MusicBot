import { GuildMember, Message, TextChannel, VoiceChannel } from "discord.js";
import { ICommand } from "../interfaces/command.interface";
import { inject, injectable } from "inversify";
import YouTube from "discord-youtube-api";
import { TYPES } from "../configs/types.config";
import { BotService } from "../services/bot.service";
import MusicSubscriptionService from "../services/music-subscription.service";
import TrackService from "../services/track.service";
import { Reactions } from "../helpers/constants";
import { AudioEffect } from "../enums/audio-effect.enum";

@injectable()
export default class PlayCommand implements ICommand {
  public name: string = "play";
  private readonly effectArgument: string = "-effect";
  @inject(TYPES.Youtube) private youtubeClient: YouTube;

  async execute(message: Message, args: string): Promise<void> {
    try {
      if (!this.validateRequest(message, args)) {
        return;
      }
      const sender: GuildMember = message.member as GuildMember;
      let subscription: MusicSubscriptionService = BotService.subscriptions.get(
        sender.guild.id
      ) as MusicSubscriptionService;

      let splitArgs = args.split(this.effectArgument);
      let effectString: string = splitArgs.length > 1 ? splitArgs[1].trim() : null;
      let audioEffect: AudioEffect = null;
      if (effectString) {
        audioEffect = this.matchAudioEffect(effectString);
      }
      const song = await this.youtubeClient.searchVideos(splitArgs[0]);

      if (!subscription) {
        subscription = new MusicSubscriptionService(
          message.channel as TextChannel,
          sender.voice.channelId
        );
        BotService.subscriptions.set(sender.guild.id, subscription);
      }

      let track: TrackService = new TrackService(song.title, song.url, audioEffect);
      subscription.audioPlayerService.play(track);
    } catch (error) {
      console.error(error);
    }
  }

  validateRequest(message: Message, args: string) {
    const sender: GuildMember = message.member as GuildMember;
    const memberChannel = sender.voice.channel as VoiceChannel;

    if (
      !memberChannel ||
      !memberChannel.speakable ||
      !memberChannel.joinable ||
      !args
    ) {
      return false;
    }
    if (message.client.voice.adapters.size === 0 && memberChannel.full) {
      return false;
    }
    if (
      message.client.voice.adapters.size === 1 &&
      !memberChannel.members.some((val: GuildMember) => val.user.bot)
    ) {
      return false;
    }

    let splitArguments = args.split(this.effectArgument);
    if (splitArguments.length > 2) {
      message.channel
        .send("Incorrect effect setting")
        .then(Reactions.reactDecline);
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
