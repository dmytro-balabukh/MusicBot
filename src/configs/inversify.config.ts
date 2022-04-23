import "reflect-metadata";
import { Container } from "inversify";
import { TYPES } from "./types.config";
import { Bot } from "../types/bot.type";
import { Client } from "discord.js";
import { IntentOptions } from "./config";
import ReadyEvent from "../events/ready.event";
import { EventService } from "../services/event.service";
import { CommunicateEvent } from "../events/communicate.event";

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

// Events
container.bind<EventService>(TYPES.EventService)
  .to(EventService).inSingletonScope();
container.bind<ReadyEvent>(TYPES.ReadyEvent)
  .to(ReadyEvent).inSingletonScope();
container.bind<CommunicateEvent>(TYPES.CommunicateEvent)
  .to(CommunicateEvent).inSingletonScope();

export default container;