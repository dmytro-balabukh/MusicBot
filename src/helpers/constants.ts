import { Message, MessageReaction } from "discord.js";
import { MessageEphasis } from "../enums/message-emphasis.enum";

export class Reactions {
  public static readonly reactSuccess = (
    message: Message
  ): Promise<MessageReaction> => message.react(MessageEphasis.Success);
  public static readonly reactDecline = (
    message: Message
  ): Promise<MessageReaction> => message.react(MessageEphasis.Decline);
}

export class ErrorResultMessage {
  public static readonly falsyValue = (type: string): string =>
    `${type} is a falsy value`;
  public static readonly indexOverflowsSizeOfArray: string =
    "Index overflows size of the array.";
  public static readonly indexIsLessThanZero: string = "indexIsLessThanZero";
}
