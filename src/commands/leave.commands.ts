import { getVoiceConnection, VoiceConnection } from "@discordjs/voice";
import { Message } from "discord.js";
import { injectable } from "inversify";
import { ICommand } from "../interfaces/command.interface";

@injectable()
export default class LeaveCommand implements ICommand {
    name: string = 'leave';

    execute(message: Message<boolean>, args?: string): void {
        const guildId: string = message.guildId as string;
        const connection: VoiceConnection = getVoiceConnection(guildId) as VoiceConnection;
        if(!connection){
            message.reply('Bot is not present in the voice channel for the moment.').then((message) => {
                message.react('❌');
            });
            return;
        }
        connection.destroy();
    }
}