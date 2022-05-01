import { AudioResource, createAudioResource, StreamType } from "@discordjs/voice";
import { injectable } from "inversify";
import { Readable } from "stream";
import ytdl from "discord-ytdl-core";
import Constants from "../helpers/constants";

@injectable()
export default class Track {

  private readonly name: string;
  private readonly url: string;

  constructor(name: string, url: string) {
    this.name = name;
    this.url = url;
  }

  public static convertToAudioResource(track: Track): AudioResource<Track> {
    const stream: Readable = Track.createStreamFromUrl(track.url);
    const resource: AudioResource = createAudioResource(stream, 
      { inputType: StreamType.Opus, metadata: track.name });

      if(!resource){
        throw new Error(Constants.FALSY_VALUE_MESSAGE(typeof(AudioResource)));
      }

    return resource as AudioResource<Track>;
  }

  private static createStreamFromUrl(url: string): Readable {
    return ytdl(url, {
      filter: "audioonly",
      opusEncoded: true,
      quality: 'highestaudio',
      highWaterMark: 1 << 25,
      encoderArgs: ['-af', 'bass=g=10,dynaudnorm=f=200'],
    });
  }
}