import { AudioPlayer, AudioPlayerStatus, AudioResource, createAudioPlayer, DiscordGatewayAdapterCreator, entersState, joinVoiceChannel, VoiceConnection, VoiceConnectionStatus } from "@discordjs/voice";
import { Guild, GuildMember, TextChannel } from "discord.js";
import ErrorResultMessage from "../helpers/constants";
import QueueManager from "./queue-manager.type";
import { Bot } from "./bot.type";
import Result from "./result.type";
import Track from "./track.type";

export default class MusicSubscription {
    public readonly voiceConnection?: VoiceConnection;
    private readonly textChannel: TextChannel;
    private readonly audioPlayer: AudioPlayer;
    public queueManager?: QueueManager;

    constructor(textChannel: TextChannel, voiceChannelId: string) {
        this.textChannel = textChannel;
        this.voiceConnection = this.createVoiceConnection(voiceChannelId);
        this.audioPlayer = createAudioPlayer();
        this.voiceConnection.subscribe(this.audioPlayer);
        this.queueManager = new QueueManager();
        this.configureConnectionStates();
        this.configureAudioPlayerIdleState();
        this.configureAudioPlayerPlayingState();
    }

    public play(track: Track): void {
        let result: Result = this.queueManager.enqueue(track);
        if (result.error) {
            console.log(result.error);
            this.textChannel.send(result.userMessage);
            return;
        }
        if (this.audioPlayer.state.status !== AudioPlayerStatus.Playing) {
            this.executeNextResource();
        }
    }

    public jump(index: number): void {
        let result: Result = this.queueManager.jump(index);
        if (result.error) {
            console.log(result.error);
            this.textChannel.send(result.userMessage);
            return;
        }
        this.executeNextResource();
    }

    public skip(): void {
        if (this.queueManager.getQueueSize() === 0) {
            this.textChannel.send("Nothing to skip.");
            return;
        }

        let result: Result<Track> = this.queueManager.dequeue();
        if (result.error) {
            console.log(result.error);
            this.textChannel.send(result.userMessage);
            return
        }

    }

    public pause(): void {
        if (this.audioPlayer.state.status !== AudioPlayerStatus.Playing) {
            this.textChannel.send("Bot is not playing any resource.");
            return;
        }
        let result: boolean = this.audioPlayer.pause();
        this.textChannel.send(`Bot was ${ result ? 'successfuly' : 'not' } paused.`);
    }

    public continue(): void {
        if (this.audioPlayer.state.status !== AudioPlayerStatus.Paused) {
            this.textChannel.send("Bot is not paused.");
            return;
        }
        let result: boolean = this.audioPlayer.unpause();
        this.textChannel.send(`Bot was ${ result ? 'successfuly' : 'not' } unpaused.`);
    }

    private createVoiceConnection(voiceChannelId: string): VoiceConnection {
        try {
            return joinVoiceChannel({
                channelId: voiceChannelId,
                guildId: this.textChannel.guildId,
                adapterCreator: this.textChannel.guild.voiceAdapterCreator as unknown as DiscordGatewayAdapterCreator
            });
        }
        catch (error) {
            console.log(error);
            this.textChannel.send("Unable to create voice connection.");
        }
    }

    private executeNextResource(): void {
        try {
            let dequeueResult: Result<Track> = this.queueManager.dequeue();
            if (dequeueResult.error) {
                console.log(dequeueResult.error);
                this.textChannel.send(dequeueResult.userMessage);
                return;
            }
            let convertToAudioResourceResult: Result<AudioResource<Track>> = Track.convertToAudioResource(dequeueResult.result);

            if (convertToAudioResourceResult.error) {
                console.log(convertToAudioResourceResult.error);
                this.textChannel.send(convertToAudioResourceResult.userMessage);
                return;
            }

            this.audioPlayer.play(convertToAudioResourceResult.result);
        } catch (error) {
            console.log(error);
            this.textChannel.send("Error occured while trying to execute next resource.")
        }
    }

    private configureAudioPlayerIdleState() {
        this.audioPlayer.on(AudioPlayerStatus.Idle, () => {
            if (this.queueManager.getQueueSize() === 0) {
                this.textChannel.send(`> **Bot has finished playing**`);
                return;
            }
            this.executeNextResource();
        })
    }

    private configureAudioPlayerPlayingState(): void {
        this.audioPlayer.on(AudioPlayerStatus.Playing, async (_, newState) => {
            this.textChannel.send(`> \`${newState.resource.metadata}\` **is now playing**`);
        })
    }

    private configureConnectionSignallingState(): void {
        this.voiceConnection.on(VoiceConnectionStatus.Signalling,
            async () => {
                try {
                    await entersState(this.voiceConnection, VoiceConnectionStatus.Ready, 15000);
                } catch (error) {
                    this.voiceConnection.destroy();
                }
            });
    }

    private configureConnectionConnectingState(): void {
        this.voiceConnection.on(VoiceConnectionStatus.Connecting,
            async () => {
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
                    if (this.voiceConnection.state.status !== VoiceConnectionStatus.Destroyed) {
                        this.voiceConnection.destroy();
                    }
                }
            })
    }

    // Move these methods out of the class
    private configureConnectionDestroyedState(): void {
        this.voiceConnection.on(VoiceConnectionStatus.Destroyed,
            () => {
                try {
                    this.queueManager = null;
                    this.audioPlayer.stop();
                    Bot.subscriptions.delete(this.textChannel.guildId);
                } catch (error) {
                    this.textChannel.send("Unable to destroy voice connection.")
                    console.log(error);
                }
            });
    }

    private configureConnectionStates(): void {
        this.configureConnectionSignallingState();
        this.configureConnectionConnectingState();
        this.configureConnectionDisconnectedState();
        this.configureConnectionDestroyedState();
    }
}