export class EnvHelper {
  public static isEnvValid(): boolean {
    if (!process.env.BOT_TOKEN) {
      console.error("MISSING BOT TOKEN");
      return false;
    }
    if (!process.env.CLIENT_ID) {
      console.error("MISSING CLIENT ID.")
      return false;
    }
    if (!process.env.GUILD_ID) {
      console.error("MISSING GUILD ID");
      return false;
    }
    if(!process.env.YOUTUBE_API_TOKEN){
      console.error("MISSING YOUTUBE API TOKEN");
      return false;
    }
    return true;
  }
}