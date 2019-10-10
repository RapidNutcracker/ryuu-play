import { Player } from "../state/player";
import { Prompt } from "./prompt";
import { StoreMessage } from "../store-messages";

export class AlertPrompt extends Prompt<void> {

  readonly type: string = 'Alert'

  constructor(player: Player, public message: StoreMessage) {
    super(player);
  }

}
