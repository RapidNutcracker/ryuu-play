import { CardList } from '../store/state/card-list';
import { CoinFlipPrompt } from '../store/prompts/coin-flip-prompt';
import { Prompt } from '../store/prompts/prompt';
import { ShufflePrompt } from '../store/prompts/shuffle-prompt';
import { StateLog } from '../store/state/state-log';
import { State } from '../store/state/state';
import { ResolvePromptAction } from '../store/actions/resolve-prompt-action';
import { GameLog } from '../game-message';


export class Arbiter {

  constructor() { }

  public resolvePrompt(state: State, prompt: Prompt<any>): ResolvePromptAction | undefined {
    const player = state.players.find(p => p.id === prompt.playerId);

    if (player === undefined) {
      return;
    }

    if (prompt instanceof ShufflePrompt) {
      const result = this.shuffle(prompt.cardList || player.deck);
      return new ResolvePromptAction(prompt.id, result);
    }

    if (prompt instanceof CoinFlipPrompt) {
      let result: boolean = true;
      if (player.marker.hasMarker('OVERTHINK_MARKER')) {
        result = false;
      } else {
        result = Math.round(Math.random()) === 0;
      }
      const message = result
        ? GameLog.LOG_PLAYER_FLIPS_HEADS
        : GameLog.LOG_PLAYER_FLIPS_TAILS;
      const log = new StateLog(message, { name: player.name });
      return new ResolvePromptAction(prompt.id, result, log);
    }
  }

  private shuffle(cardList: CardList): number[] {
    const len = cardList.cards.length;
    const order: number[] = [];

    for (let i = 0; i < len; i++) {
      order.push(i);
    }

    for (let i = 0; i < len; i++) {
      const position = Math.min(len - 1, Math.round(Math.random() * len));
      const tmp = order[i];
      order[i] = order[position];
      order[position] = tmp;
    }

    return order;
  }

}
