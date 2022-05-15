import ArrayUtils from "../helpers/array-utilts";
import ErrorResultMessage from "../helpers/constants";
import ErrorResult from "../helpers/constants";
import { DeclineMessage } from "../types/message/models/declined-message.type";
import { SuccessMessage } from "../types/message/models/success-message.type";
import Result from "../types/result.type";
import Track from "../types/track.type";

export default class QueueHandler {

  private queue: Track[];

  constructor() {
    this.queue = [];
  }

  // TODO: Check if decorator can check param for null and throw exception
  // becuase you do this 'not null' check in every method.

  enqueue(track: Track): Result {
    this.queue.push(track)
    return Result.Empty(new SuccessMessage(`> \`${track.name}\` **has been added to the queue**`));
  }

  dequeue(): Result<Track> {
    let track: Track = this.queue.shift() as Track;
    return Result.createSuccessResult<Track>(track);
  }

  jump(index: number): Result<void> {
    if(index < 0) {
      return Result.createErrorResult(ErrorResultMessage.indexIsLessThanZero,
        new DeclineMessage(`Unable to jump to the specified index.`));
    }
    if(this.queue.length - 1 < index) {
      return Result.createErrorResult(ErrorResultMessage.indexOverflowsSizeOfArray,
        new DeclineMessage(`Unable to jump to the specified index.`));
    }
    this.queue = this.queue.slice(index);
    return Result.Empty(new SuccessMessage("Successfully jumped to the specified index."));
  }

  wipeQueue(): void {
    this.queue = [];
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  getTracksNames = (): string[]  => this.queue.map(obj => obj.name);
}