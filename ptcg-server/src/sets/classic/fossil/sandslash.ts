import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, GameMessage, CoinFlipPrompt, Resistance } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';

export class Sandslash extends PokemonCard {

  public id: number = 70;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom = 'Sandshrew';

  public cardTypes: CardType[] = [CardType.FIGHTING];

  public hp: number = 70;

  public weakness = [{ type: CardType.GRASS }];

  public resistance: Resistance[] = [{ type: CardType.LIGHTNING, value: -30 }];

  public retreat = [CardType.COLORLESS];

  public attacks = [{
    name: 'Slash',
    cost: [CardType.COLORLESS, CardType.COLORLESS],
    damage: 20,
    text: ''
  }, {
    name: 'Fury Swipes',
    cost: [CardType.FIGHTING, CardType.FIGHTING],
    damage: 20,
    text:
      'Flip 3 coins. This attack does 20 damage times the number of heads.'
  }];

  public set: string = 'FO';

  public name: string = 'Sandslash';

  public fullName: string = 'Sandslash FO';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Fury Swipes
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;
      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP),
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP),
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], results => {
        let heads: number = 0;
        results.forEach(r => { heads += r ? 1 : 0; });
        effect.damage = 20 * heads;
      });
    }

    return state;
  }
}
