import { Collection } from "discord.js";
import { inject, injectable } from "inversify";
import HelpCommand from "../commands/help.command";
import LeaveCommand from "../commands/leave.commands";
import PlayCommand from "../commands/play.command";
import StatsCommand from "../commands/stats.command";
import { TYPES } from "../configs/types.config";
import { ICommand } from "../interfaces/command.interface";

@injectable()
export default class CommandHandler {
    public readonly commands: Collection<string, ICommand> = new Collection();

    // Check for multi-inject
    constructor(
        @inject(TYPES.HelpCommand) helpCommand: HelpCommand,
        @inject(TYPES.StatsCommand) statsCommand: StatsCommand,
        @inject(TYPES.PlayCommand) playCommand: PlayCommand,
        @inject(TYPES.LeaveCommand) leaveCommand: LeaveCommand) {
        this.commands.set(helpCommand.name, helpCommand);
        this.commands.set(statsCommand.name, statsCommand);
        this.commands.set(playCommand.name, playCommand);
        this.commands.set(leaveCommand.name, leaveCommand);
    }
}