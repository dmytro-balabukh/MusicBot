export default class Utils {
    public static isArrayNullOrEmpty<T>(array: T[]): boolean {
        if(!array || array.length === 0){
            return true;
        }
        return false;
    }

    public static getIndexOfRandomValue(arrayLength: number): number {
        if(!arrayLength) {
            return;
        }

        return Math.floor(Math.random() * arrayLength);
    }

    public static shuffleArray<T>(array: T[]): T[] {
        let currentIndex: number = array.length;
        let randomIndex: number;
      
        // While there remain elements to shuffle.
        while (currentIndex != 0) {
      
          // Pick a remaining element.
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex--;
      
          // And swap it with the current element.
          [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
        }
      
        return array;
      }

      public static getEnumKeyByEnumValue<T extends {[index:string]: string | number}>(myEnum:T, enumValue:number|string):keyof T|null {
        let keys = Object.keys(myEnum).filter(x => myEnum[x] == enumValue);
        return keys.length > 0 ? keys[0] : null;
      }
      
}