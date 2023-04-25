import { Client } from "discord.js";
import { injectable } from "inversify";
import { IReadyEvent } from "../interfaces/event/ready-event.interface";

@injectable()
export default class ReadyEvent implements IReadyEvent {
  name: string = 'ready';

  execute(client: Client): void {
    try {
      if (!client.user) {
        // TODO: ADD SUCH THINGS TO SERVICE.
        console.log("CLIENT USER IS NULL OR UNDEFINED.")
        return;
      }
      console.log(`
      =====================================
      Ready! Logged in as ${client.user.tag}
      =====================================
      `);
    } catch (error) {
      console.log('Error while executing READY event.', error)
    }
  }

  configure(client: Client): void {
    client.once(this.name, () => this.execute(client));
  }
}