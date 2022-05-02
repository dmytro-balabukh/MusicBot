import ArrayUtils from "../helpers/array-utilts";
import Constants from "../helpers/constants";
import Track from "./track.type";

export default class AudioQueue {

  private queue: Track[];

  constructor() {
    this.queue = [];
  }

  // TODO: Check if decorator can check param for null and throw exception
  // becuase you do this 'not null' check in every method.

  enqueue(track: Track): void {
    if (!this.queue) {
      throw new Error(Constants.FALSY_VALUE_MESSAGE(typeof(this)));
    }
    this.queue.push(track)
  }

  dequeue(): Track {
    if(ArrayUtils.isNullOrEmpty(this.queue)){
      throw new Error(Constants.FALSY_VALUE_MESSAGE(typeof(this)));
    }
    let track: Track = this.queue.shift() as Track;
    return track;
  }

  jump(index: number): void {
    if(ArrayUtils.isNullOrEmpty(this.queue)) {
      throw new Error(Constants.FALSY_VALUE_MESSAGE(typeof(this)));
    }
    if(index < 0) {
      throw new Error('Index is less then zero.');
    }
    if(this.queue.length - 1 < index) {
      throw new Error(Constants.INDEX_OVERFLOWS_SIZE_OF_ARRAY);
    }
    this.queue = this.queue.slice(index);
  }

  wipe(): void {
    this.queue = [];
  }

  size(): number {
    if(!this.queue) {
      throw new Error(Constants.FALSY_VALUE_MESSAGE(typeof(this)));
    }
    return this.queue.length;
  }

  getTracksNames = (): string[]  => this.queue.map(obj => obj.name);
}