import { Message, TextChannel } from "discord.js";

// Decompose send and reply
export default class MessageService {
    constructor(private readonly textChannel: TextChannel) {
    }

    sendInfo(messageText: string): void {
        this.textChannel.send(messageText);
    }

    sendSuccess(messageText: string): void {
        this.textChannel.send(messageText)
            .then((message: Message) => message.react('✅'));
    }

    sendDecline(messageText: string): void {
        this.textChannel.send(messageText).then((message: Message) => {
            message.react('❌');
        });
    }

    replyInfo(messageText: string, messageToReply: Message): void {
        messageToReply.reply(messageText);
    }

    replySuccess(messageText: string, messageToReply: Message): void {
        messageToReply.reply(messageText)
            .then((message: Message) => message.react('✅'));
    }

    replyError(messageText: string, messageToReply: Message): void {
        messageToReply.reply(messageText).then((message: Message) => {
            message.react('❌');
        });;
    }
}