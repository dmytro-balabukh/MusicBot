import { Message } from "discord.js";

export interface ICommand {
    readonly name: string;
    execute(message: Message, args?: string): void
}