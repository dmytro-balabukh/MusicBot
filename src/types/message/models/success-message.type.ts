import { Message, MessageReaction } from "discord.js";
import { MessageEphasis } from "../../../enums/message-emphasis.enum";
import { IEmphasizedMessage } from "../../../interfaces/message/emphasized-message.interface";

export class SuccessMessage implements IEmphasizedMessage{
    messageText: string;
    messageEmphasis: MessageEphasis = MessageEphasis.Success;
    messageReaction = (message: Message): Promise<MessageReaction> => message.react(this.messageEmphasis);

    constructor(messageText: string) {
        this.messageText = messageText;
    }
}