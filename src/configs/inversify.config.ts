import "reflect-metadata";
import { Container } from "inversify";
import { TYPES } from "./types.config";
import { Bot } from "../types/bot.type";
import { Client } from "discord.js";
import { IntentOptions } from "./config";
import ReadyEvent from "../events/ready.event";
import EventHandler from "../handlers/event.handler";
import { CommunicateEvent } from "../events/communicate.event";
import HelpCommand from "../commands/help.command";
import CommandHandler from "../handlers/command.handler";
import StatsCommand from "../commands/stats.command";
import PlayCommand from "../commands/play.command";
import LeaveCommand from "../commands/leave.commands";
import YouTube from "discord-youtube-api";
import AudioQueue from "../types/audio-queue.type";
import MusicSubscription from "../types/music-subscription.type";
import Track from "../types/track.type";
import QueueCommand from "../commands/queue.command";
import JumpCommand from "../commands/jump.command";

let container = new Container();

// Bot and related to its creation objects
container.bind<Bot>(TYPES.Bot).to(Bot).inSingletonScope();
container.bind<Client>(TYPES.Client).toConstantValue(
  new Client({ intents: IntentOptions }));
container.bind<string>(TYPES.Token)
  .toConstantValue(process.env.BOT_TOKEN as string);
container.bind<string>(TYPES.ClientId)
  .toConstantValue(process.env.CLIENT_ID as string);
container.bind<string>(TYPES.GuildId)
  .toConstantValue(process.env.GUILD_ID as string)
container.bind<string>(TYPES.YoutubeToken)
  .toConstantValue(process.env.YOUTUBE_API_TOKEN as string);

// Events
container.bind<ReadyEvent>(TYPES.ReadyEvent)
  .to(ReadyEvent).inSingletonScope();
container.bind<CommunicateEvent>(TYPES.CommunicateEvent)
  .to(CommunicateEvent).inSingletonScope();

//Commands
container.bind<HelpCommand>(TYPES.HelpCommand)
  .to(HelpCommand).inSingletonScope();
container.bind<StatsCommand>(TYPES.StatsCommand)
  .to(StatsCommand).inSingletonScope();
container.bind<PlayCommand>(TYPES.PlayCommand)
  .to(PlayCommand).inSingletonScope();
container.bind<LeaveCommand>(TYPES.LeaveCommand)
  .to(LeaveCommand).inSingletonScope();

  container.bind<QueueCommand>(TYPES.QueueCommand)
  .to(QueueCommand).inSingletonScope();
  // container.bind<SkipCommamd>(TYPES.SkipCommamd)
  // .to(SkipCommamd).inSingletonScope();
  container.bind<JumpCommand>(TYPES.JumpCommand)
  .to(JumpCommand).inSingletonScope();
  // container.bind<PauseCommand>(TYPES.PauseCommand)
  // .to(PauseCommand).inSingletonScope();
  // container.bind<ContinueCommand>(TYPES.ContinueCommand)
  // .to(ContinueCommand).inSingletonScope();

// Handlers
container.bind<EventHandler>(TYPES.EventHandler)
  .to(EventHandler).inSingletonScope();
container.bind<CommandHandler>(TYPES.CommandHandler)
  .to(CommandHandler).inSingletonScope();

// Miscelaneous
container.bind<YouTube>(TYPES.Youtube)
  .toConstantValue(new YouTube(container.get<string>(TYPES.YoutubeToken)));

container.bind<AudioQueue>(TYPES.AudioQueue)
  .to(AudioQueue).inSingletonScope();
container.bind<MusicSubscription>(TYPES.MusicSubscription)
  .to(MusicSubscription).inSingletonScope();
container.bind<Track>(TYPES.Track)
  .to(Track).inSingletonScope();

export default container;