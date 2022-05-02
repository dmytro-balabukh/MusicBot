import { Collection } from "discord.js";
import { inject, injectable } from "inversify";
import HelpCommand from "../commands/help.command";
import JumpCommand from "../commands/jump.command";
import LeaveCommand from "../commands/leave.commands";
import PlayCommand from "../commands/play.command";
import QueueCommand from "../commands/queue.command";
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
        @inject(TYPES.LeaveCommand) leaveCommand: LeaveCommand,
        //@inject(TYPES.PauseCommand) pauseCommand: PauseCommand,
        //@inject(TYPES.ContinueCommand) continueCommand: ContinueCommand,
        //@inject(TYPES.SkipCommand) skipCommand: SkipCommand,
        @inject(TYPES.JumpCommand) jumpCommand: JumpCommand,
        @inject(TYPES.QueueCommand) queueCommand: QueueCommand) {
        this.commands.set(helpCommand.name, helpCommand);
        this.commands.set(statsCommand.name, statsCommand);
        this.commands.set(playCommand.name, playCommand);
        this.commands.set(leaveCommand.name, leaveCommand);
        this.commands.set(queueCommand.name, queueCommand);
        this.commands.set(jumpCommand.name, jumpCommand);
    }
}