import {
  AudioPlayer,
  createAudioPlayer,
  DiscordGatewayAdapterCreator,
  entersState,
  joinVoiceChannel,
  VoiceConnection,
  VoiceConnectionStatus,
} from "@discordjs/voice";
import {
  TextChannel,
} from "discord.js";
import QueueHandler from "../handlers/queue.handler";
import { BotService } from "./bot.service";
import TrackService from "./track.service";
import { inject } from "inversify";
import AudioPlayerService from "./audio-player/audio-player.service";
import { TYPES } from "../configs/types.config";
import { EventEmitter } from "stream";
import VoiceConnectionService from "./voice-connection.service";

export default class MusicSubscriptionService {
  public readonly voiceConnectionService?: VoiceConnectionService;
  public readonly audioPlayerService: AudioPlayerService;
  private readonly textChannel: TextChannel;

  constructor(textChannel: TextChannel, voiceChannelId: string,) {
    this.textChannel = textChannel;
    this.audioPlayerService = new AudioPlayerService(textChannel);
    this.voiceConnectionService = new VoiceConnectionService(textChannel, voiceChannelId);
    this.voiceConnectionService.voiceConnection.subscribe(this.audioPlayerService.audioPlayer);
    this.configureDestroy();
  }

  private configureDestroy() {
    this.voiceConnectionService.voiceConnection.on(VoiceConnectionStatus.Destroyed, () => {
      try {
        this.audioPlayerService.flush();
        BotService.subscriptions.delete(this.textChannel.guildId);
      } catch (error) {
        this.textChannel.send("Unable to destroy voice connection.").then();
        console.log(error);
      }
    })
  }
}
