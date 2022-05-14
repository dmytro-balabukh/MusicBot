import { Message, TextChannel } from "discord.js";
import { IMessageStrategy } from "../../../interfaces/message-strategy.interface";
import { ICasualMessage } from "../../../interfaces/message/casual-message.interface";

export class CasualMessageStrategy implements IMessageStrategy{
    send(textChannel: TextChannel, message: ICasualMessage) {
        textChannel.send(message.messageText);
    }
    reply(message: ICasualMessage, replyMessage: Message) {
        replyMessage.reply(message.messageText);
    }
}