import { Message, TextChannel } from "discord.js";
import * as fs from "fs";
import { injectable } from "inversify";
import path from "path";
import { ICommand } from "../interfaces/command.interface";

@injectable()
export default class HelpCommand implements ICommand {
    name: string = 'help';

    execute(message: Message): void {
        const channel: TextChannel = message.channel as TextChannel;
        const text: string = fs.readFileSync(path.join(__dirname, './bot-help.txt'), 'utf-8');
        channel.send(text);
    }
}