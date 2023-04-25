import { ErrorResultMessage } from "../helpers/constants";
import Utils from "../helpers/utils";
import ResultService from "../services/result.service";
import TrackService from "../services/track.service";

export default class QueueHandler {
  private queue: TrackService[];

  private lastTakenFromQueue: TrackService;
  public get lastShiftElement() : TrackService {
    return this.lastTakenFromQueue;
  }
  

  constructor() {
    this.queue = [];
  }

  // TODO: Check if decorator can check param for null and throw exception
  // becuase you do this 'not null' check in every method.

  enqueue(track: TrackService): ResultService {
    this.queue.push(track);
    return ResultService.Empty(
      `> \`${track.name}\` **has been added to the queue**`
    );
  }

  dequeue(): ResultService<TrackService> {
    this.lastTakenFromQueue = this.queue.shift() as TrackService;
    return ResultService.createSuccessResult<TrackService>(
      this.lastShiftElement
    );
  }

  jump(index: number): ResultService<void> {
    if (index < 0) {
      return ResultService.createErrorResult(
        ErrorResultMessage.indexIsLessThanZero,
        `Unable to jump to the specified index.`
      );
    }
    if (this.queue.length - 1 < index) {
      return ResultService.createErrorResult(
        ErrorResultMessage.indexOverflowsSizeOfArray,
        `Unable to jump to the specified index.`
      );
    }
    this.queue = this.queue.slice(index);
    return ResultService.Empty("Successfully jumped to the specified index.");
  }

  wipeQueue(): void {
    this.queue = [];
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  getTracks = (): TrackService[] => this.queue;
}
