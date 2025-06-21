import { Effect } from '../../../game/store/effects/effect';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Power, Resistance } from '../../../game/store/card/pokemon-types';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { State } from '../../../game/store/state/state';
import { StoreLike } from '../../../game/store/store-like';
import { AttackEffect } from '../../../game/store/effects/game-effects';

export class Cleffa extends PokemonCard {

  public id: number = 80;

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.PSYCHIC];

  public hp: number = 30;

  public weakness = [{ type: CardType.METAL }];

  public resistance: Resistance[] = [];

  public retreat = [];

  public powers: Power[] = [];

  public attacks = [{
    name: 'Grasping Draw',
    cost: [CardType.NONE],
    damage: 0,
    text: 'Draw cards until you have 7 cards in your hand.'
  }];

  public set: string = 'OBF';

  public name: string = 'Cleffa';

  public fullName: string = 'Cleffa OBF';

  public readonly QUICK_SEARCH_MARKER = 'QUICK_SEARCH_MARKER';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    // Grasping Draw
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const cards = player.hand.cards.filter(c => c !== this);
      const cardsToDraw = Math.max(0, 7 - cards.length);

      if (cardsToDraw === 0 || player.deck.cards.length === 0) {
        return state;
      }

      player.deck.moveTo(player.hand, cardsToDraw);
    }

    return state;
  }
}
