import { ICasualMessage } from "../interfaces/message/casual-message.interface";

export default class Result<T = void> {
    private constructor(
        public result?: T, 
        public userMessage?: ICasualMessage, 
        public error?: string) {
    }

    public static createSuccessResult<T = void>(result: T, customMessage?: ICasualMessage): Result<T> {
        if(!result){
            throw new Error("createSuccessResult<T> can't accept falsy result.")
        }
        return new Result<T>(result, customMessage, null);
    }

    public static createErrorResult<T = void>(errorMessage: string, customMessage?: ICasualMessage): Result<T> {
        if(!errorMessage){
            throw new Error("createErrorResult<T> can't accept falsy errorMessage.")
        }
        return new Result<T>(null, customMessage, errorMessage);
    }

    public getValue(): T {
        if(this.error){
            throw new Error("Unable to get value due to existing error");
        }
        return this.result;
    }

    public static readonly Empty = (message: ICasualMessage): Result<void> => 
                                   new Result<void>(null, message, null);
}