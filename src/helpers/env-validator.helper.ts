export class EnvHelper {
  public static isEnvValid(): boolean {
    let validationResult: boolean = true;
    if (!process.env.BOT_TOKEN) {
      console.error("MISSING BOT TOKEN");
      validationResult = false;
    }
    if (!process.env.CLIENT_ID) {
      console.error("MISSING CLIENT ID.")
      validationResult = false;
    }
    if (!process.env.GUILD_ID) {
      console.error("MISSING GUILD ID");
      validationResult = false;
    }
    if(!process.env.YOUTUBE_API_TOKEN){
      console.error("MISSING YOUTUBE API TOKEN");
      validationResult = false;
    }
    return validationResult;
  }
}