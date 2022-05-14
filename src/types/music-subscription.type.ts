import { AudioPlayer, AudioPlayerStatus, AudioResource, createAudioPlayer, DiscordGatewayAdapterCreator, entersState, joinVoiceChannel, VoiceConnection, VoiceConnectionStatus } from "@discordjs/voice";
import { TextChannel } from "discord.js";
import QueueHandler from "../handlers/queue.handler";
import { Bot } from "./bot.type";
import Result from "./result.type";
import Track from "./track.type";
import MessageHandler from "../handlers/message.handler";
import { CasualMessageStrategy } from "./message/strategies/casual-message-strategy.type";
import { CasualMessage } from "./message/models/casual-message.type";
import { EmphasizedMessageStrategy } from "./message/strategies/emphasized-message-strategy.type";
import { DeclineMessage } from "./message/models/declined-message.type";
import { SuccessMessage } from "./message/models/success-message.type";

export default class MusicSubscription {
    public readonly voiceConnection?: VoiceConnection;
    private readonly textChannel: TextChannel;
    private readonly audioPlayer: AudioPlayer;
    public queueHandler?: QueueHandler;
    public messageHandler: MessageHandler;

    constructor(textChannel: TextChannel, voiceChannelId: string) {
        this.textChannel = textChannel;
        this.voiceConnection = this.createVoiceConnection(voiceChannelId);
        this.audioPlayer = createAudioPlayer();
        this.voiceConnection.subscribe(this.audioPlayer);
        this.queueHandler = new QueueHandler();
        this.configureConnectionStates();
        this.configureAudioPlayerIdleState();
        this.configureAudioPlayerPlayingState();
        this.messageHandler = new MessageHandler(this.textChannel);
    }

    public play(track: Track): void {
        let result: Result = this.queueHandler.enqueue(track);
        this.messageHandler.setStrategy(new EmphasizedMessageStrategy());
        this.messageHandler.send(result.userMessage);

        if (this.audioPlayer.state.status !== AudioPlayerStatus.Playing) {
            this.executeNextResource();
        }
    }

    public jump(index: number): void {
        let result: Result = this.queueHandler.jump(index);
        if (result.error) {
            console.log(result.error);
            this.messageHandler.send(result.userMessage);
            return;
        }
        this.messageHandler.send(result.userMessage);
        this.executeNextResource();
    }

    public skip(): void {
        this.messageHandler.setStrategy(new EmphasizedMessageStrategy());
        if (this.queueHandler.getQueueSize() === 0) {
            this.messageHandler.send(new DeclineMessage("Queue is empty. Nothing to skip."));
            return;
        }

        let result: Result<Track> = this.queueHandler.dequeue();
        this.messageHandler.send(result.userMessage);
    }

    public pause(): void {
        this.messageHandler.setStrategy(new EmphasizedMessageStrategy());
        if (this.audioPlayer.state.status !== AudioPlayerStatus.Playing) {
            this.messageHandler.send(new DeclineMessage("Bot is not playing any resource."));
            return;
        }
        let result: boolean = this.audioPlayer.pause();
        this.messageHandler.send(result ? new SuccessMessage(`Bot was successfuly paused.`) :
            new DeclineMessage('Bot could not be paused due to internal errors.'));
    }

    public continue(): void {
        this.messageHandler.setStrategy(new EmphasizedMessageStrategy());
        if (this.audioPlayer.state.status !== AudioPlayerStatus.Paused) {
            this.messageHandler.send(new DeclineMessage('Bot is not paused at the moment.'));
            return;
        }
        let result: boolean = this.audioPlayer.unpause();
        this.messageHandler.send(result ? new SuccessMessage(`Bot was successfuly unpaused.`) :
            new DeclineMessage('Bot could not be unpaused due to internal errors.'));
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
            this.messageHandler.setStrategy(new EmphasizedMessageStrategy());
            this.messageHandler.send(new DeclineMessage("Unable to create voice connection."));
        }
    }

    private executeNextResource(): void {
        try {
            let dequeueResult: Result<Track> = this.queueHandler.dequeue();
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
            if (this.queueHandler.getQueueSize() === 0) {
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
                    this.queueHandler = null;
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