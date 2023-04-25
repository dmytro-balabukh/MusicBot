import { ICasualMessage } from "../../../interfaces/message/casual-message.interface";

export class CasualMessage implements ICasualMessage {
    public messageText: string;

    constructor(messageText: string) {
        this.messageText = messageText;
    }
}