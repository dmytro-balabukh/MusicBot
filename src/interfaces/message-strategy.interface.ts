import { Message, TextChannel } from "discord.js";
import { ICasualMessage } from "./message/casual-message.interface";

export interface IMessageStrategy {
    send(textChannel: TextChannel, message: ICasualMessage);
    reply(message: ICasualMessage, replyTo: Message);
}