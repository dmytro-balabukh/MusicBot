import { Client } from "discord.js";
import { inject, injectable } from "inversify";
import { TYPES } from "../configs/types.config";
import { CommunicateEvent } from "../events/communicate.event";
import ReadyEvent from "../events/ready.event";

@injectable()
export default class EventHandlers {
  private readonly readyEvent: ReadyEvent;
  private readonly communicateEvent: CommunicateEvent;

  constructor(
    @inject(TYPES.ReadyEvent) readyEvent: ReadyEvent,
    @inject(TYPES.CommunicateEvent) communicateEvent: CommunicateEvent
  ) {
    this.readyEvent = readyEvent;
    this.communicateEvent = communicateEvent;
  }
  public async configureEvents(client: Client) {
    this.readyEvent.configure(client);
    this.communicateEvent.configure(client);
  }
}