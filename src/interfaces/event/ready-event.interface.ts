import { Client } from "discord.js";
import { IEvent } from "./event.interface";

export interface IReadyEvent extends IEvent {
    execute(client: Client): void;
}