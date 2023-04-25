import { Message } from "discord.js";
import { IEvent } from "./event.interface";

export interface ICommunicateEvent extends IEvent {
    execute(message: Message): void;
    validateMessage(message: Message): void;
}