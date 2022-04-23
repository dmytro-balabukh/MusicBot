import { Client, Message } from "discord.js";
import { injectable } from "inversify";
import { ICommunicateEvent } from "../interfaces/event.interface";

@injectable()
export class CommunicateEvent implements ICommunicateEvent {
  name: string = 'messageCreate';

  constructor() {
    this.execute = this.execute.bind(this);
  }
  execute(message: Message): void {
    if (!this.validateMessage(message)) {
      return;
    }
    console.log(message.content);
  }

  configure(client: Client): void {
    client.on(this.name, this.execute);
  }

  // add typeof(msg) == 'reply'
  validateMessage(message: Message): boolean {
    if (message.author.bot || message.type === 'REPLY'
      || !message.content.startsWith('!')) {
      return false;
    }
    return true;
  }
}