import { Message, MessageReaction } from "discord.js";
import { MessageEphasis } from "../../../enums/message-emphasis.enum";
import { IEmphasizedMessage } from "../../../interfaces/message/emphasized-message.interface";

export class DeclineMessage implements IEmphasizedMessage {
    public messageText: string;
    public readonly messageEmphasis: MessageEphasis = MessageEphasis.Decline;
    messageReaction = (message: Message): Promise<MessageReaction> => message.react(this.messageEmphasis);
    
    constructor(messageText: string) {
        this.messageText = messageText;
    }
}