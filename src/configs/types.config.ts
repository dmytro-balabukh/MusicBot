export const TYPES = {
  // Bot related
  Bot: Symbol.for('Bot'),
  Client: Symbol.for('Client'),
  Token: Symbol.for('Token'),
  ClientId: Symbol.for('ClientId'),
  GuildId: Symbol.for('GuildId'),
  YoutubeToken: Symbol.for('YoutubeToken'),
  TextChannel: Symbol.for('TextChannel'),

  // Handlers
  EventHandler: Symbol.for('EventHandler'),
  CommandHandler: Symbol.for('CommandHandler'),
  QueueHandler: Symbol.for('QueueHandler'),

  // Events
  ReadyEvent: Symbol.for('ReadyEvent'),
  CommunicateEvent: Symbol.for('CommunicateEvent'),
  
  // Commands
  HelpCommand: Symbol.for('HelpCommand'),
  StatsCommand: Symbol.for('StatsCommand'),
  PlayCommand: Symbol.for('PlayCommand'),
  GuessCommand: Symbol.for('GuessCommand'),
  LeaveCommand: Symbol.for('LeaveCommand'),
  QueueCommand: Symbol.for('QueueCommand'),
  PauseCommand: Symbol.for('PauseCommand'),
  ContinueCommand: Symbol.for('ContinueCommand'),
  SkipCommand: Symbol.for('SkipCommand'),
  JumpCommand: Symbol.for('JumpCommand'),
  EffectCommand: Symbol.for('EffectCommand'),

  Track: Symbol.for('Track'),
  MusicSubscription: Symbol.for('MusicSubscription'),

  //Miscelaneous
  Youtube: Symbol.for('Youtube'),
  YoutubeService: Symbol.for('YoutubeService'),
};