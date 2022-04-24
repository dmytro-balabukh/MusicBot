import { Message, TextChannel } from "discord.js";
import { injectable } from "inversify";
import { ICommand } from "../interfaces/command.interface";

@injectable()
export default class StatsCommand implements ICommand {
    name: string = 'stats';

    execute(message: Message): void {
        const channel: TextChannel = message.channel as TextChannel;
        channel.send(
			`Server name: ${channel.guild.name}\nTotal members: ${channel.guild.memberCount}`,
		);
    }
}