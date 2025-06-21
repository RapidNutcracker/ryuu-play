import { AttackEffect } from '../../../game/store/effects/game-effects';
import { Effect } from '../../../game/store/effects/effect';
import { GameMessage } from '../../../game/game-message';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import {
  StoreLike,
  State,
  Resistance,
  CoinFlipPrompt
} from '../../../game';

export class Aron extends PokemonCard {

  public id: number = 25;

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.METAL];

  public hp: number = 50;

  public weakness = [{ type: CardType.FIRE }];

  public resistance: Resistance[] = [{ type: CardType.GRASS, value: -30 }];

  public retreat = [CardType.COLORLESS];

  public attacks = [{
    name: 'Rollout',
    cost: [CardType.METAL],
    damage: 10,
    text: ''
  }, {
    name: 'Double Stab',
    cost: [CardType.COLORLESS, CardType.COLORLESS],
    damage: 20,
    text: 'Flip 2 coins. This attack does 20 damage times the number of heads.'
  }];

  public set: string = 'RS';

  public name: string = 'Aron';

  public fullName: string = 'Aron RS';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Double Stab
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;
      return store.prompt(state, [
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
