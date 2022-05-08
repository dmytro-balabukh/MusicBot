import ArrayUtils from "../helpers/array-utilts";
import ErrorResultMessage from "../helpers/constants";
import ErrorResult from "../helpers/constants";
import Result from "./result.type";
import Track from "./track.type";

export default class QueueManager {

  private queue: Track[];

  constructor() {
    this.queue = [];
  }

  // TODO: Check if decorator can check param for null and throw exception
  // becuase you do this 'not null' check in every method.

  enqueue(track: Track): Result {
    this.queue.push(track)
    return Result.Empty(`Added ${ track.name } to the queue.`);
  }

  dequeue(): Result<Track> {
    let track: Track = this.queue.shift() as Track;
    return Result.createSuccessResult<Track>(track);
  }

  jump(index: number): Result<void> {
    if(index < 0) {
      return Result.createErrorResult(ErrorResultMessage.indexIsLessThanZero,
        `Unable to jump to the specified index.`);
    }
    if(this.queue.length - 1 < index) {
      return Result.createErrorResult(ErrorResultMessage.indexOverflowsSizeOfArray,
        `Unable to jump to the specified index.`);
    }
    this.queue = this.queue.slice(index);
    return Result.Empty("Successfully jumped to the specified index.")
  }

  wipeQueue(): void {
    this.queue = [];
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  getTracksNames = (): string[]  => this.queue.map(obj => obj.name);
}