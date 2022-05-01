import { Type } from "typescript";

export default class Constants {
    public static readonly FALSY_VALUE_MESSAGE = (type: string): string => `${type} is a falsy value`;
    public static readonly INDEX_OVERFLOWS_SIZE_OF_ARRAY: string = 'Index overflows size of the array.'
}