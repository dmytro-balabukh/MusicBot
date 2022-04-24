import { Client } from "discord.js";
import { inject, injectable } from "inversify";
import container from "../configs/inversify.config";
import { TYPES } from "../configs/types.config";
import EventHandler from "../handlers/event.handler";
import ReadyEvent from "../events/ready.event";

@injectable()
export class Bot {
  constructor(
    @inject(TYPES.Token) private readonly token: string,
    @inject(TYPES.GuildId) private readonly guildId: string,
    @inject(TYPES.ClientId) private readonly clientId: string, 
    @inject(TYPES.Client) private readonly client: Client,
    @inject(TYPES.EventHandler) private readonly eventService: EventHandler) {
    this.client.login(this.token);
  }

  public async configureEvents(): Promise<void> {
    await this.eventService.configureEvents(this.client);
  }
}