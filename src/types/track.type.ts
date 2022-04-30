import { AudioResource, createAudioResource, StreamType } from "@discordjs/voice";
import { injectable } from "inversify";
import { Readable } from "stream";
import ytdl from "discord-ytdl-core";

@injectable()
export default class Track {

  public readonly name: string;
  public readonly url: string;

  constructor(name: string, url: string) {
    this.name = name;
    this.url = url;
  }

  public static convertToAudioResource(track: Track): AudioResource<Track> {
    const stream: Readable = ytdl(track.url, {
      filter: "audioonly",
      opusEncoded: true,
      quality: 'highestaudio',
      highWaterMark: 1 << 25,
      encoderArgs: ['-af', 'bass=g=10,dynaudnorm=f=200'],
    });
    const resource: AudioResource = createAudioResource(stream, 
      { inputType: StreamType.Opus, metadata: track.name });

      if(!resource){
        throw new Error("AudioResource is a falsy value.");
      }

    return resource as AudioResource<Track>;
  }
}