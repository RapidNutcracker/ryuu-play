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

export class Aggron extends PokemonCard {

  public id: number = 1;

  public stage: Stage = Stage.STAGE_2;

  public evolvesFrom: string = 'Lairon';

  public cardTypes: CardType[] = [CardType.METAL];

  public hp: number = 110;

  public weakness = [{ type: CardType.FIRE }];

  public resistance: Resistance[] = [{ type: CardType.GRASS, value: -30 }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [{
    name: 'Retaliate',
    cost: [CardType.COLORLESS],
    damage: 10,
    text: 'Flip a coin. If heads, this attack does 10 damage times the number of damage counters on Aggron.'
  }, {
    name: 'Mega Punch',
    cost: [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS],
    damage: 40,
    text: ''
  }, {
    name: 'Double Lariat',
    cost: [CardType.METAL, CardType.METAL, CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS],
    damage: 70,
    text: 'Flip 2 coins. This attack does 70 damage times the number of heads.'
  }];

  public set: string = 'RS';

  public name: string = 'Aggron';

  public fullName: string = '#1 Aggron RS';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Retaliate
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], result => {
        if (result === true) {
          effect.damage = 10 * effect.player.active.damage;
        }
      });
    }

    // Double Lariat
    if (effect instanceof AttackEffect && effect.attack === this.attacks[2]) {
      const player = effect.player;
      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP),
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], results => {
        let heads: number = 0;
        results.forEach(r => { heads += r ? 1 : 0; });
        effect.damage = 70 * heads;
      });
    }

    return state;
  }
}
