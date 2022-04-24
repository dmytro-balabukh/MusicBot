import { Channel, Message } from "discord.js";

export interface ICommand {
    name: string;
    execute(message: Message, args?: string): void
}