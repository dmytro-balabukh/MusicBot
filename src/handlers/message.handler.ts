import { Message, TextChannel } from "discord.js";
import { injectable } from "inversify";
import { IMessageStrategy } from "../interfaces/message-strategy.interface";
import { ICasualMessage } from "../interfaces/message/casual-message.interface";

@injectable()
export default class MessageHandler {
    private strategy: IMessageStrategy;
    private textChannel: TextChannel;

    public setChannel(newChannel: TextChannel){
        this.textChannel = newChannel;
    }

    public setStrategy(newStrategy: IMessageStrategy){
        this.strategy = newStrategy;
    }

    public send(message: ICasualMessage){
        this.strategy.send(this.textChannel, message);
    }

    public reply(message: ICasualMessage, messageToReply: Message){
        this.strategy.reply(message, messageToReply);
    }
}
