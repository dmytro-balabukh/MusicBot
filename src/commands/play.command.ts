import { Client, Guild, GuildMember, Message, TextChannel, VoiceChannel } from "discord.js"
import { ICommand } from "../interfaces/command.interface";
import {
    AudioPlayerStatus,
    StreamType,
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
    VoiceConnection,
    DiscordGatewayAdapterCreator,
    AudioResource,
    AudioPlayer
} from "@discordjs/voice"
import ytdl from "discord-ytdl-core";
import { Readable, Stream } from "stream";
import { injectable } from "inversify";
import YouTube from "discord-youtube-api";
import container from "../configs/inversify.config";
import { TYPES } from "../configs/types.config";

@injectable()
export default class PlayCommand implements ICommand {
    name: string = 'play';
    async execute(message: Message, args: string): Promise<void> {
        const member: GuildMember = message.member as GuildMember;
        if (!this.validateRequest(message, args)) {
            return;
        }
        const youtubeClient: YouTube = container.get<YouTube>(TYPES.Youtube);
        const song = await youtubeClient.searchVideos(args);
        const connection: VoiceConnection = this.createVoiceConnectionFromMember(member);

        const stream: Readable = ytdl(song.url, {
            filter: "audioonly",
            opusEncoded: true,
            quality: 'highestaudio',
            highWaterMark: 1 << 25,
            encoderArgs: ['-af', 'bass=g=10,dynaudnorm=f=200']
        });

        const resource: AudioResource = createAudioResource(stream, { inputType: StreamType.Opus });
        const player: AudioPlayer = createAudioPlayer();

        player.play(resource);
        connection.subscribe(player);

        player.on('error', (obj) => {
            console.log(obj);
        });
        player.on(AudioPlayerStatus.Idle, () => connection.destroy());

        message.reply(`> \`${song.title}\` **has been added to the queue.**`)
            .then((message: Message) => message.react('✅'));
    }

    createVoiceConnectionFromMember(member: GuildMember): VoiceConnection {
        return joinVoiceChannel({
            channelId: member.voice.channelId as string,
            guildId: member.guild.id,
            adapterCreator: member.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator,
        });
    }

    validateRequest(message: Message, args: string) {
        const member: GuildMember = message.member as GuildMember;
        const memberChannel = member.voice.channel as VoiceChannel;

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