export const TYPES = {
  // Bot related
  Bot: Symbol.for('Bot'),
  Client: Symbol.for('Client'),
  Token: Symbol.for('Token'),
  ClientId: Symbol.for('ClientId'),
  GuildId: Symbol.for('GuildId'),
  YoutubeToken: Symbol.for('YoutubeToken'),

  // Handlers
  EventHandler: Symbol.for('EventHandler'),
  CommandHandler: Symbol.for('CommandHandler'),
  // Events
  ReadyEvent: Symbol.for('ReadyEvent'),
  CommunicateEvent: Symbol.for('CommunicateEvent'),
  // Commands
  HelpCommand: Symbol.for('HelpCommand'),
  StatsCommand: Symbol.for('StatsCommand'),
  PlayCommand: Symbol.for('PlayCommand'),
  LeaveCommand: Symbol.for('LeaveCommand'),

  //Miscelaneous
  Youtube: Symbol.for('Youtube')
};