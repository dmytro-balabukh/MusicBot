export default class ArrayUtils {
    public static isNullOrEmpty<T>(array: T[]): boolean {
        if(!array || array.length === 0){
            return true;
        }
        return false;
    }
}