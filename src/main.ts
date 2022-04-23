import { Bot } from "./types/bot.type";
import { TYPES } from "./configs/types.config";
import { EnvHelper } from "./helpers/env-validator.helper";
import container from "./configs/inversify.config";

(async () => {
  // if (!EnvHelper.isEnvValid()) {
  //   return;
  // }
  const BOT = await container.getAsync<Bot>(TYPES.Bot);
  BOT.configureEvents();
})();

