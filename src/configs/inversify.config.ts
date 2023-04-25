import "reflect-metadata";
import { Container } from "inversify"
import { TYPES } from "./types.config";
import { BotService } from "../services/bot.service";
import { Client, TextChannel } from "discord.js"
import { IntentOptions } from "./config";
import ReadyEvent from "../events/ready.event";
import { EventHandlers as EventHandler } from "../handlers/event.handler";
import { CommunicateEvent } from "../events/communicate.event";
import HelpCommand from "../commands/help.command";
import CommandHandler from "../handlers/command.handler";
import StatsCommand from "../commands/stats.command";
import PlayCommand from "../commands/play.command";
import LeaveCommand from "../commands/leave.commands";
import YouTube from "discord-youtube-api";
import QueueHandler from "../handlers/queue.handler";
import MusicSubscriptionService from "../services/music-subscription.service";
import TrackService from "../services/track.service";
import QueueCommand from "../commands/queue.command";
import JumpCommand from "../commands/jump.command";
import SkipCommand from "../commands/skip.command";
import PauseCommand from "../commands/pause.command";
import ContinueCommand from "../commands/continue.command";
import GuessCommand from "../commands/guess.command";
import YoutubeService from "../services/youtube/youtube.service";
import EffectCommand from "../commands/effect.command";

let container = new Container();

// Bot and related to its creation objects
container.bind<BotService>(TYPES.Bot).to(BotService).inSingletonScope();
container.bind<Client>(TYPES.Client).toConstantValue(
  new Client({ intents: IntentOptions, restRequestTimeout: 60000 }));
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
container.bind<GuessCommand>(TYPES.GuessCommand)
.to(GuessCommand).inSingletonScope();
container.bind<LeaveCommand>(TYPES.LeaveCommand)
  .to(LeaveCommand).inSingletonScope();

container.bind<QueueCommand>(TYPES.QueueCommand)
.to(QueueCommand).inSingletonScope();
container.bind<SkipCommand>(TYPES.SkipCommand)
.to(SkipCommand).inSingletonScope();
container.bind<JumpCommand>(TYPES.JumpCommand)
.to(JumpCommand).inSingletonScope();
container.bind<PauseCommand>(TYPES.PauseCommand)
.to(PauseCommand).inSingletonScope();
container.bind<ContinueCommand>(TYPES.ContinueCommand)
.to(ContinueCommand).inSingletonScope();
container.bind<EffectCommand>(TYPES.EffectCommand)
.to(EffectCommand).inSingletonScope();

// Handlers
container.bind<EventHandler>(TYPES.EventHandler)
  .to(EventHandler).inSingletonScope();
container.bind<CommandHandler>(TYPES.CommandHandler)
  .to(CommandHandler).inSingletonScope();
container.bind<QueueHandler>(TYPES.QueueHandler)
  .to(QueueHandler).inRequestScope();
  
// Miscelaneous
container.bind<YouTube>(TYPES.Youtube)
  .toConstantValue(new YouTube(container.get<string>(TYPES.YoutubeToken)));

container.bind<MusicSubscriptionService>(TYPES.MusicSubscription)
  .to(MusicSubscriptionService).inSingletonScope();

container.bind<YoutubeService>(TYPES.YoutubeService)
.to(YoutubeService).inSingletonScope();

container.bind<TrackService>(TYPES.Track)
  .to(TrackService).inSingletonScope();

export default container;