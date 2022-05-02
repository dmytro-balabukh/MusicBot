import { Channel, Client, Message } from "discord.js";
import { inject, injectable } from "inversify";
import { TYPES } from "../configs/types.config";
import CommandHandler from "../handlers/command.handler";
import { ICommunicateEvent } from "../interfaces/event.interface";

@injectable()
export class CommunicateEvent implements ICommunicateEvent {
  name: string = 'messageCreate';

  constructor(@inject(TYPES.CommandHandler) private commandHandler: CommandHandler) {
  }
  execute(message: Message): void {
    try {
      if (!this.validateMessage(message)) {
        return;
      }
      let messageArgs: string[] = message.content.substring(1)
        .split(' ')
      let commandName: string = messageArgs.shift() as string;
      let command = this.commandHandler.commands.get(commandName);
      if (!command) {
        return;
      }
      command.execute(message, messageArgs.join(' '));
    } catch (error) {
      console.log('Error occured while executing COMMUNICATE EVENT.', error);
    }
  }

  configure(client: Client): void {
    client.on(this.name, (message: Message) => this.execute(message));
  }

  validateMessage(message: Message): boolean {
    if (!message.guild || message.author.bot || message.type === 'REPLY'
      || !message.content.startsWith('!')) {
      return false;
    }
    return true;
  }

  getCommandName(messageContent: string[]): string {
    return messageContent.shift() as string;
  }
}