import {
  AudioPlayer,
  AudioPlayerStatus,
  AudioResource,
  createAudioPlayer,
} from "@discordjs/voice";
import QueueHandler from "../../handlers/queue.handler";
import { Reactions } from "../../helpers/constants";
import ResultService from "../result.service";
import TrackService from "../track.service";
import YoutubeSearchResult from "../youtube/models/youtube-search-result.model";
import {
  ButtonInteraction,
  MessageActionRow,
  MessageButton,
  TextChannel,
} from "discord.js";
import { MessageComponentTypes } from "discord.js/typings/enums";
import Utils from "../../helpers/utils";
import { injectable } from "inversify";
import { Snowflake } from "discord.js";
import UserGuess from "./models/user-guess.model";
import moment from "moment";
import { AudioEffect } from "../../enums/audio-effect.enum";

@injectable()
export default class AudioPlayerService {
  public readonly audioPlayer: AudioPlayer;
  public queueHandler: QueueHandler;
  public audioEffect: AudioEffect;
  // <userId, optionNumber>
  private userGuesses: Map<Snowflake, UserGuess>;

  constructor(private textChannel: TextChannel) {
    this.audioPlayer = createAudioPlayer();
    this.audioEffect = AudioEffect.Off;
    this.queueHandler = new QueueHandler();
    this.configureAudioPlayer();
  }

  private executeNextResource(sendNotificationMessage: boolean = true): void {
    try {
      let dequeueResult: ResultService<TrackService> =
        this.queueHandler.dequeue();
      let convertToAudioResourceResult: ResultService<
        AudioResource<TrackService>
      > = TrackService.convertToAudioResource(dequeueResult.result, this.audioEffect);

      if (convertToAudioResourceResult.error) {
        console.log(convertToAudioResourceResult.error);
        this.textChannel
          .send("Unable to execute next resource.")
          .then(Reactions.reactDecline);
        return;
      }
      this.audioPlayer.on('error', error => {
        console.log(error);
      });
      this.audioPlayer.play(convertToAudioResourceResult.result);
        
      if (sendNotificationMessage) {
        let x = AudioEffect['bass=g=20,dynaudnorm=f=200' as keyof typeof AudioEffect];
        this.textChannel.send(
          `> \`${dequeueResult.result.name}\` **is now playing**. Effect: ${Utils.getEnumKeyByEnumValue(AudioEffect, dequeueResult.result.audioEffect) ?? Utils.getEnumKeyByEnumValue(AudioEffect, this.audioEffect)}`
        );
      }
    } catch (error) {
      console.log(error);
      this.textChannel
        .send("Unhandled error occured while trying to execute next resource.")
        .then(Reactions.reactDecline);
    }
  }

  public play(track: TrackService): void {
    let result: ResultService = this.queueHandler.enqueue(track);
    this.textChannel.send(result.userMessage).then(Reactions.reactSuccess);

    if (this.audioPlayer.state.status !== AudioPlayerStatus.Playing) {
      this.executeNextResource();
    }
  }

  public guess(track: TrackService, options: YoutubeSearchResult[]): void {
    // if bot is playing then no guess game is allowed, stop the bot first
    if (this.audioPlayer.state.status == AudioPlayerStatus.Playing) {
      this.textChannel
        .send("Music Bot is currently busy. No game allowed.")
        .then(Reactions.reactSuccess);
      return;
    }

    this.userGuesses = new Map<Snowflake, UserGuess>();
    // Create buttons with song names on it
    let buttonOptions: MessageButton[] = [];
    options.forEach((opt) => {
      buttonOptions.push(
        new MessageButton()
          .setCustomId(opt.title.substring(0, Math.min(opt.title.length, 100)))
          .setLabel(opt.title.substring(0, Math.min(opt.title.length, 80)))
          .setStyle("PRIMARY")
      );
    });

    // Shuffle buttons
    const actionRow = new MessageActionRow().addComponents(
      Utils.shuffleArray(buttonOptions)
    );

    let messageBody = { content: "Your options", components: [actionRow] };
    this.textChannel.send(messageBody).then((message) => {
      this.queueHandler.enqueue(track);
      this.executeNextResource();
      let buttonsIds: string[] = buttonOptions.map(obj => obj.customId);
      const filter = (buttonInteraction: ButtonInteraction) => {
        buttonInteraction.deferUpdate();
        return buttonOptions.some(obj => obj.customId === buttonInteraction.customId);
      };

      let messageColector = this.textChannel.createMessageComponentCollector({
        componentType: MessageComponentTypes.BUTTON,
        filter,
        time: 15000,
      });
      var startTime: moment.Moment = moment();
      messageColector.on("collect", (i: ButtonInteraction) => {
        // You can add id in YoutubeSarchResult and search by this.
        this.userGuesses.set(i.user.id, new UserGuess(i.customId, new Date()));
      });

      messageColector.on("end", () => {
        this.audioPlayer.stop();
        buttonOptions.forEach((btn) => {
          btn.setDisabled(true);
          message.edit(messageBody);
        });

        if (!this.userGuesses) {
          this.textChannel.send("Nobody participated in the game.");
          return;
        }

        let finalMessage: string = `The guess song was: ${track.name}\nUser guesses were:\n`;
        let counter = 1;
        for (const [key, value] of this.userGuesses.entries()) {
          let guesserNickname: string =
            this.textChannel.members.get(key).displayName;
          // calculate total duration
          var duration = moment.duration(
            moment(value.guessTime).diff(startTime)
          );

          // duration in minutes
          var minutes = Math.floor(duration.asMinutes());
          var seconds = duration.asSeconds() - minutes * 60;

          finalMessage += `${counter}. ${guesserNickname} - ${value.optionId} | ${minutes}:${seconds} \n`;

          ++counter;
        }
        this.textChannel.send(finalMessage);
      });
    });
  }

  public jump(index: number): void {
    let result: ResultService = this.queueHandler.jump(index);
    if (result.error) {
      console.log(result.error);
      this.textChannel.send(result.userMessage).then(Reactions.reactDecline);
      return;
    }
    this.textChannel.send(result.userMessage).then(Reactions.reactSuccess);
    this.executeNextResource();
  }

  public skip(): void {
    if (this.audioPlayer.state.status !== AudioPlayerStatus.Playing) {
      this.textChannel.send("Nothing to skip.").then(Reactions.reactDecline);
      return;
    }
    this.audioPlayer.stop();

    //let result: Result<Track> = this.queueHandler.dequeue();
    //this.messageHandler.send(result.userMessage);
  }

  public pause(): void {
    if (this.audioPlayer.state.status !== AudioPlayerStatus.Playing) {
      this.textChannel
        .send("Bot is not playing any resource.")
        .then(Reactions.reactDecline);
      return;
    }
    let result: boolean = this.audioPlayer.pause();
    result
      ? this.textChannel
          .send("Bot was successfuly paused.")
          .then(Reactions.reactSuccess)
      : this.textChannel
          .send("Bot could not be paused due to internal errors.")
          .then(Reactions.reactDecline);
  }

  public continue(): void {
    if (this.audioPlayer.state.status !== AudioPlayerStatus.Paused) {
      this.textChannel
        .send("Bot is not paused at the moment.")
        .then(Reactions.reactDecline);
      return;
    }
    let result: boolean = this.audioPlayer.unpause();
    if (!result) {
      this.textChannel
        .send("Bot could not be unpaused due to internal errors.")
        .then(Reactions.reactDecline);
    }
  }

  public flush(): void {
    this.queueHandler = null;
    this.audioPlayer.stop();
  }

  private configureAudioPlayer(): void {
    this.configureAudioPlayerIdleState();
  }

  private configureAudioPlayerIdleState() {
    this.audioPlayer.on(AudioPlayerStatus.Idle, () => {
      if (this.queueHandler.getQueueSize() === 0) {
        this.textChannel.send(`> **Bot has finished playing**`);
        return;
      }
      this.executeNextResource();
    });
  }
}
