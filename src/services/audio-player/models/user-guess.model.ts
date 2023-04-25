export default class UserGuess {
  optionId: string;
  guessTime: Date;

  constructor(optionId: string, guessTime: Date) {
    this.optionId = optionId;
    this.guessTime = guessTime;
  }
}
