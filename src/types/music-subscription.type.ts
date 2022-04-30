import { AudioPlayer, AudioPlayerStatus, createAudioPlayer, DiscordGatewayAdapterCreator, entersState, joinVoiceChannel, VoiceConnection, VoiceConnectionState, VoiceConnectionStatus } from "@discordjs/voice";
import { GuildMember } from "discord.js";
import AudioQueue from "./audio-queue.type";
import Track from "./track.type";

export default class MusicSubscription {
    public readonly voiceConnection: VoiceConnection;
    public readonly audioPlayer: AudioPlayer;
    public queue: AudioQueue;


    constructor(sender: GuildMember) {
        this.voiceConnection = this.createVoiceConnectionFromSender(sender);
        this.audioPlayer = createAudioPlayer();
        this.voiceConnection.subscribe(this.audioPlayer);
        this.queue = new AudioQueue();
        this.configureConnectionStates();
        this.configureAudioPlayerIdleState();
        this.configureAudioPlayerPlayingState();
    }

    private createVoiceConnectionFromSender(sender: GuildMember): VoiceConnection {
        return joinVoiceChannel({
            channelId: sender.voice.channelId as string,
            guildId: sender.guild.id,
            adapterCreator: sender.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator,
        });
    }

    private executeNextResource(): void {
        try {
            let track: Track = this.queue.dequeue();
            let audioResourceFromTrack = Track.convertToAudioResource(track);
            this.audioPlayer.play(audioResourceFromTrack);
        } catch (error) {
            console.error('Error occured while trying to execute next resource.', error);
            return this.executeNextResource();
        }
    }

    private configureAudioPlayerIdleState() {
        this.audioPlayer.on(AudioPlayerStatus.Idle, () => {
            console.log("IDLE STATE");
            if(this.queue.size() == 0) {
                console.log("ALL TRACKS HAS BEEN PLAYED");
                return;
            }
            this.executeNextResource();
        })
    }
    
    private configureAudioPlayerPlayingState(): void {
        this.audioPlayer.on(AudioPlayerStatus.Playing, async (_, newState) => {
            // show here something like ("Horse with no name has started playing")\
            // btw, this should be displayed as a message in channel
            console.log(newState.resource.metadata);
        })
    }

    public addTrack(track: Track): void{
        this.queue.enqueue(track);
        if(this.audioPlayer.state.status !== AudioPlayerStatus.Playing) {
            this.executeNextResource();
        }
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
                    this.voiceConnection.destroy();
                }
            })
    }

    // Move thesse methods out of the class
    private configureConnectionDestroyedState(): void {
        this.voiceConnection.on(VoiceConnectionStatus.Destroyed, 
           async () => {
                await this.flush();
        });
    }

    private configureConnectionStates(): void {
        this.configureConnectionSignallingState();
        this.configureConnectionConnectingState();
        this.configureConnectionDisconnectedState();
        this.configureConnectionDestroyedState();
    }

    private async flush(): Promise<void> {
       this.audioPlayer.stop();
       await this.queue.wipe();
    }
}