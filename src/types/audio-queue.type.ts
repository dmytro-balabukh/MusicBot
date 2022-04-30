import ArrayUtils from "../helpers/array-utilts";
import Track from "./track.type";

export default class AudioQueue {

  private readonly FALSY_VALUE_MESSAGE: string = 'Queue is a falsy value.';
  private readonly INDEX_OVERFLOWS_SIZE_OF_ARRAY: string = 'Index overflows size of the array.'

  queue: Track[];

  constructor() {
    this.queue = [];
  }

  enqueue(track: Track): void {
    if (!this.queue) {
      throw new Error(this.FALSY_VALUE_MESSAGE);
    }
    this.queue.push(track)
  }

  dequeue(): Track {
    if(ArrayUtils.isNullOrEmpty(this.queue)){
      throw new Error(this.FALSY_VALUE_MESSAGE);
    }
    let track: Track = this.queue.shift() as Track;
    return track;
  }

  jump(index: number): void {
    if(ArrayUtils.isNullOrEmpty(this.queue)) {
      console.log(this.FALSY_VALUE_MESSAGE);
      return;
    }
    if(this.queue.length < index) {
      console.log(this.INDEX_OVERFLOWS_SIZE_OF_ARRAY);
    }
    this.queue = this.queue.slice(index);
  }

  wipe(): void {
    this.queue = [];
  }

  size(): number {
    if(!this.queue) {
      throw new Error(this.FALSY_VALUE_MESSAGE);
    }
    return this.queue.length;
  }
}