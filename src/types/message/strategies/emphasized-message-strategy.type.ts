import { Message, TextChannel } from "discord.js";
import { IMessageStrategy } from "../../../interfaces/message-strategy.interface";
import { IEmphasizedMessage } from "../../../interfaces/message/emphasized-message.interface";

export class EmphasizedMessageStrategy implements IMessageStrategy{
    send(textChannel: TextChannel,message: IEmphasizedMessage) {
        textChannel.send(message.messageText).then(message.messageReaction);
    }
    reply(message: IEmphasizedMessage, replyMessage: Message) {
        replyMessage.reply(message.messageText).then(message.messageReaction);
    }
}