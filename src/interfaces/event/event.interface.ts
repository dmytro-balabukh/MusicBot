import { Client } from "discord.js";

export interface IEvent {
  readonly name: string;
  configure(client: Client): void;
}