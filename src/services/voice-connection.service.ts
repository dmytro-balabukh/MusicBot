import {
  DiscordGatewayAdapterCreator,
  VoiceConnection,
  VoiceConnectionStatus,
  entersState,
  joinVoiceChannel,
} from "@discordjs/voice";
import { TextChannel } from "discord.js";
import { injectable } from "inversify";
import { Reactions } from "../helpers/constants";

@injectable()
export default class VoiceConnectionService {
  public readonly voiceConnection: VoiceConnection;

  constructor(private textChannel: TextChannel, voiceChannelId: string) {
    this.voiceConnection = this.createVoiceConnection(voiceChannelId).on('debug', (obj) => {console.log(obj)})
    .on('error', (obj) => {console.log(obj)});;
  }

  public configureConnectionStates(): void {
    this.configureConnectionSignallingState();
    this.configureConnectionConnectingState();
    this.configureConnectionDisconnectedState();
    this.configureStateChange();
  }

  private createVoiceConnection(voiceChannelId: string): VoiceConnection {
    try {
      return joinVoiceChannel({
        channelId: voiceChannelId,
        guildId: this.textChannel.guildId,
        adapterCreator: this.textChannel.guild
          .voiceAdapterCreator as unknown as DiscordGatewayAdapterCreator,
      });
    } catch (error) {
      console.log(error);
      this.textChannel
        .send("Unable to create voice connection.")
        .then(Reactions.reactDecline);
    }
  }

  private configureConnectionSignallingState(): void {
    this.voiceConnection.on(VoiceConnectionStatus.Signalling, async () => {
      try {
        await entersState(
          this.voiceConnection,
          VoiceConnectionStatus.Ready,
          15000
        );
      } catch (error) {
        this.voiceConnection.destroy();
      }
    });
  }

  private configureConnectionConnectingState(): void {
    this.voiceConnection.on(VoiceConnectionStatus.Connecting, async () => {
      try {
        await entersState(
          this.voiceConnection,
          VoiceConnectionStatus.Ready,
          15000
        );
      } catch (error) {
        if (
          this.voiceConnection.state.status !== VoiceConnectionStatus.Destroyed
        ) {
          this.voiceConnection.destroy();
        }
      }
    });
  }

  private configureConnectionDisconnectedState(): void {
    this.voiceConnection.on(VoiceConnectionStatus.Disconnected, async () => {
      try {
        await Promise.race([
          entersState(
            this.voiceConnection,
            VoiceConnectionStatus.Signalling,
            5000
          ),
          entersState(
            this.voiceConnection,
            VoiceConnectionStatus.Connecting,
            5000
          ),
        ]);
      } catch (error) {
        if (
          this.voiceConnection.state.status !== VoiceConnectionStatus.Destroyed
        ) {
          this.voiceConnection.destroy();
        }
      }
    });
  }

  private configureStateChange(): void {
    this.voiceConnection.on("stateChange", (oldState, newState) => {
      console.log(
        "join",
        "Connection state change from",
        oldState.status,
        "to",
        newState.status
      );
    });
  }
}
