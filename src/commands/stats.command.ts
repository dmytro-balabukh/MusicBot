import { Message, TextChannel } from "discord.js";
import { inject, injectable } from "inversify";
import { TYPES } from "../configs/types.config";
import MessageHandler from "../handlers/message.handler";
import { ICommand } from "../interfaces/command.interface";
import { CasualMessage } from "../types/message/models/casual-message.type";
import { CasualMessageStrategy } from "../types/message/strategies/casual-message-strategy.type";

@injectable()
export default class StatsCommand implements ICommand {
    name: string = 'stats';
    @inject(TYPES.MessageHandler) private messageHandler: MessageHandler;

    execute(message: Message): void {
        const channel: TextChannel = message.channel as TextChannel;
        this.messageHandler.setChannel(channel);
        this.messageHandler.setStrategy(new CasualMessageStrategy());
        
        this.messageHandler.send(new CasualMessage(
			`> **\`Server name\`**: ${channel.guild.name}\n> **\`Total Members\`**: ${channel.guild.memberCount}`));
    }
}