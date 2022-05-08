import { Type } from "typescript";

export default class ErrorResultMessage {
    public static readonly falsyValue = (type: string): string => `${type} is a falsy value`;
    public static readonly indexOverflowsSizeOfArray: string = 'Index overflows size of the array.'
    public static readonly indexIsLessThanZero: string = 'indexIsLessThanZero'
}