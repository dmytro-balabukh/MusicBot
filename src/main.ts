import { BotService } from "./services/bot.service";
import { TYPES } from "./configs/types.config";
import { EnvHelper } from "./helpers/env-validator.helper";
import container from "./configs/inversify.config";

(async () => {
  if (!EnvHelper.isEnvValid()) {
    return;
  }
  try {
    const BOT = await container.getAsync<BotService>(TYPES.Bot);
    await BOT.configureEvents();
  }
  catch(error){
    console.log(error);
  }
})();

