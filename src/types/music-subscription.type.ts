import { AudioPlayer, AudioPlayerStatus, createAudioPlayer, DiscordGatewayAdapterCreator, entersState, joinVoiceChannel, VoiceConnection, VoiceConnectionStatus } from "@discordjs/voice";
import { Guild, GuildMember, TextChannel } from "discord.js";
import AudioQueue from "./audio-queue.type";
import { Bot } from "./bot.type";
import Track from "./track.type";

export default class MusicSubscription {
    public readonly voiceConnection?: VoiceConnection;
    private readonly textChannel: TextChannel;
    private readonly audioPlayer: AudioPlayer;
    public queue?: AudioQueue;
    
    constructor(textChannel: TextChannel, voiceChannelId: string) {
        this.textChannel = textChannel;
        this.voiceConnection = this.createVoiceConnection(voiceChannelId);
        this.audioPlayer = createAudioPlayer();
        this.voiceConnection.subscribe(this.audioPlayer);
        this.queue = new AudioQueue();
        this.configureConnectionStates();
        this.configureAudioPlayerIdleState();
        this.configureAudioPlayerPlayingState();
    }
    
    public play(track: Track): void {
        this.queue.enqueue(track);
        if(this.audioPlayer.state.status !== AudioPlayerStatus.Playing) {
            this.executeNextResource();
        }
    }

    public jump(index: number): void {
        try {
            this.queue.jump(index);
            this.executeNextResource();   
        } catch (error) {
            console.log(error);
            this.textChannel.send("CANNOT JUMP");
        }
    }

    private createVoiceConnection(voiceChannelId: string): VoiceConnection {
        return joinVoiceChannel({
            channelId: voiceChannelId,
            guildId: this.textChannel.guildId,
            adapterCreator: this.textChannel.guild.voiceAdapterCreator as unknown as DiscordGatewayAdapterCreator
        });
    }

    private executeNextResource(): void {
        try {
            let track: Track = this.queue.dequeue();
            let audioResourceFromTrack = Track.convertToAudioResource(track);
            this.audioPlayer.play(audioResourceFromTrack);
        } catch (error) {
            this.textChannel.send("Error occured while trying to execute next resource")
            return this.executeNextResource();
        }
    }

    private configureAudioPlayerIdleState() {
        this.audioPlayer.on(AudioPlayerStatus.Idle, () => {
            if(this.queue.size() === 0) {
                this.textChannel.send(`> **Bot has finished playing**`);
                return;
            }
            this.executeNextResource();
        })
    }
    
    private configureAudioPlayerPlayingState(): void {
        this.audioPlayer.on(AudioPlayerStatus.Playing, async (_, newState) => {
            this.textChannel.send(`> \`${ newState.resource.metadata }\` **is now playing**`);
        })
    }

    private configureConnectionSignallingState(): void {
        this.voiceConnection.on(VoiceConnectionStatus.Signalling,
            async() => {
                try {
                    await entersState(this.voiceConnection, VoiceConnectionStatus.Ready, 15000);
                } catch (error) {
                    this.voiceConnection.destroy();
                }
            });
    }
    
    private configureConnectionConnectingState(): void {
        this.voiceConnection.on(VoiceConnectionStatus.Connecting,
            async() => {
                try {
                    await entersState(this.voiceConnection, VoiceConnectionStatus.Ready, 15000);
                } catch (error) {
                    this.voiceConnection.destroy();
                }
            });
    }
    
    private configureConnectionDisconnectedState(): void {
        this.voiceConnection.on(VoiceConnectionStatus.Disconnected,
            async () => {
                try {
                    await Promise.race([
                    entersState(this.voiceConnection, VoiceConnectionStatus.Signalling, 5000),
                    entersState(this.voiceConnection, VoiceConnectionStatus.Connecting, 5000)]);
                } catch (error) {
                    if(this.voiceConnection.state.status !== VoiceConnectionStatus.Destroyed) {
                        this.voiceConnection.destroy();
                    }
                }
            })
    }

    // Move thesse methods out of the class
    private configureConnectionDestroyedState(): void {
        this.voiceConnection.on(VoiceConnectionStatus.Destroyed, 
            () => {
                this.queue = null;
                this.audioPlayer.stop();
                Bot.subscriptions.delete(this.textChannel.guildId);
        });
    }

    private configureConnectionStates(): void {
        this.configureConnectionSignallingState();
        this.configureConnectionConnectingState();
        this.configureConnectionDisconnectedState();
        this.configureConnectionDestroyedState();
    }
}