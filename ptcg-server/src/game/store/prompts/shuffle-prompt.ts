import { Prompt } from './prompt';
import { State } from '../state/state';
import { CardList } from '../state/card-list';

export class ShufflePrompt extends Prompt<number[]> {

  readonly type: string = 'Shuffle Card List';

  constructor(playerId: number, public cardList?: CardList) {
    super(playerId);
  }

  public validate(result: number[] | null, state: State): boolean {
    if (result === null) {
      return false;
    }

    const player = state.players.find(p => p.id === this.playerId);
    if (player === undefined) {
      return false;
    }

    if (this.cardList === undefined) {
      this.cardList = player.deck;
    }

    if (result.length !== this.cardList.cards.length) {
      return false;
    }

    const s = result.slice();
    s.sort();
    for (let i = 0; i < s.length; i++) {
      if (s[i] !== i) {
        return false;
      }
    }

    return true;
  }

}
