import { GuildMember, Message, TextChannel, VoiceChannel } from "discord.js";
import { ICommand } from "../interfaces/command.interface";
import { AudioPlayerStatus,
        StreamType,
        createAudioPlayer,
        createAudioResource,
        joinVoiceChannel, 
        VoiceConnection, 
        DiscordGatewayAdapterCreator,
        AudioResource,
        AudioPlayer} from "@discordjs/voice";
import ytdl from "ytdl-core";
import { Readable } from "stream";
import { injectable } from "inversify";
import YouTube from "discord-youtube-api";
import process from "process";
import container from "../configs/inversify.config";
import { TYPES } from "../configs/types.config";

@injectable()
export default class PlayCommand implements ICommand {
    name: string = 'play';
    async execute(message: Message, args: string): Promise<void> {
        const member: GuildMember = message.member as GuildMember;
        const youtube: YouTube = container.get<YouTube>(TYPES.Youtube);
        const url = (await youtube.searchVideos(args)).url;
        const connection: VoiceConnection = this.createVoiceConnectionFromMember(member);
        const stream: Readable = ytdl(url, { filter: 'audioonly' });
        const resource: AudioResource = createAudioResource(stream, { inputType: StreamType.Arbitrary });
        const player: AudioPlayer = createAudioPlayer();
        
        player.play(resource);
        connection.subscribe(player);
        
        player.on(AudioPlayerStatus.Idle, () => connection.destroy());
    }

    createVoiceConnectionFromMember(member: GuildMember): VoiceConnection {
        return joinVoiceChannel({
            channelId: member.voice.channelId as string,
            guildId: member.guild.id,
            adapterCreator: member.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator,
        });
    }

}