import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, CoinFlipPrompt, Resistance, Weakness } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { GameMessage } from '../../../game/game-message';

export class Poliwhirl extends PokemonCard {

  public id: number = 61;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Poliwag';

  public cardTypes: CardType[] = [CardType.WATER];

  public hp: number = 90;

  public weakness: Weakness[] = [{ type: CardType.LIGHTNING }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS];

  public attacks = [{
    name: 'Wave Splash',
    cost: [CardType.WATER],
    damage: 20,
    text: ''
  }, {
    name: 'Frog Hop',
    cost: [CardType.WATER, CardType.COLORLESS],
    damage: 30,
    text: 'Flip a coin. If heads, this attack does 60 more damage.'
  }];

  public set: string = 'MEW';

  public name: string = 'Poliwhirl';

  public fullName: string = 'Poliwhirl MEW';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Frog Hop
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;

      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], result => {
        if (result === true) {
          effect.damage += 60;
        }
      });
    }

    return state;
  }

}
