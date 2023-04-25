import { AudioResource, createAudioResource, StreamType } from "@discordjs/voice";
import { injectable } from "inversify";
import { Readable } from "stream";
import ytdl from "discord-ytdl-core"
import ResultService from "./result.service";
import { ErrorResultMessage } from "../helpers/constants";
import { AudioEffect } from "../enums/audio-effect.enum";


@injectable()
export default class TrackService {

  public readonly name: string;
  public readonly url: string;
  public readonly audioEffect?: AudioEffect;

  constructor(name: string, url: string, audioEffect?: AudioEffect) {
    this.name = name;
    this.url = url;
    this.audioEffect = audioEffect;
  }

  public static convertToAudioResource(track: TrackService, globalAudioEffect: AudioEffect): ResultService<AudioResource<TrackService>> {
    const audioEffectToAccept: AudioEffect = track.audioEffect ?? globalAudioEffect;
    const stream: Readable = TrackService.createStreamFromUrl(track.url, audioEffectToAccept);
    const resource: AudioResource = createAudioResource(stream, 
      { inputType: StreamType.Opus, metadata: track.name });

      if(!resource){
        return ResultService.createErrorResult(ErrorResultMessage.falsyValue(typeof(track)));
      }

    return ResultService.createSuccessResult(resource as AudioResource<TrackService>);
  }

  private static createStreamFromUrl(url: string, audioEffect: AudioEffect): Readable {
    return ytdl(url, {
      filter: "audioonly",
      opusEncoded: true,
      quality: 'highestaudio',
      highWaterMark: 1 << 25,
      encoderArgs: ['-af', audioEffect],
    });
  }
}