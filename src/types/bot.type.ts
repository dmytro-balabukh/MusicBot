import { Client, Snowflake } from "discord.js";
import { inject, injectable } from "inversify";
import container from "../configs/inversify.config";
import { TYPES } from "../configs/types.config";
import EventHandler from "../handlers/event.handler";
import ReadyEvent from "../events/ready.event";
import MusicSubscription from "./music-subscription.type";

@injectable()
export class Bot {

  // guildId, MusicSubscription
  public static subscriptions = new Map<Snowflake, MusicSubscription>();
  constructor(
    @inject(TYPES.Token) private readonly token: string,
    @inject(TYPES.GuildId) private readonly guildId: string,
    @inject(TYPES.ClientId) private readonly clientId: string,
    @inject(TYPES.Client) private readonly client: Client,
    @inject(TYPES.EventHandler) private readonly eventHandler: EventHandler) {
    this.client.login(this.token);
  }

  public async configureEvents(): Promise<void> {
    await this.eventHandler.configureEvents(this.client);
  }
}