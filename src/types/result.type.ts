export default class Result<T = void> {
    private constructor(
        public result?: T, 
        public userMessage?: string, 
        public error?: string) {
    }

    public static createSuccessResult<T = void>(result: T, customMessage?: string): Result<T> {
        if(!result){
            throw new Error("createSuccessResult<T> can't accept falsy result.")
        }
        return new Result<T>(result, customMessage, null);
    }

    public static createErrorResult<T = void>(errorMessage: string, customMessage?: string): Result<T> {
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

    public static readonly Empty = (customMessage: string): Result<void> => 
                                   new Result<void>(null, customMessage, null);
}