import { Client, Message } from "discord.js";

export interface IEvent {
  name: string;
  configure(client: Client): void;
}

export interface IReadyEvent extends IEvent {
  execute(client: Client): void;
}

export interface ICommunicateEvent extends IEvent {
  execute(message: Message): void;
  validateMessage(message: Message): void;
}