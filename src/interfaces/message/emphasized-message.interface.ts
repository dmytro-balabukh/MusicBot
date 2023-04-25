import { Message, MessageReaction } from "discord.js";
import { MessageEphasis } from "../../enums/message-emphasis.enum";
import { ICasualMessage } from "./casual-message.interface";

export interface IEmphasizedMessage extends ICasualMessage {
    readonly messageEmphasis: MessageEphasis;
    messageReaction(message: Message): Promise<MessageReaction>
}