import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { CoinFlipPrompt, GameMessage, State, StoreLike, Weakness } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';

export class Voltorb extends PokemonCard {

  public id: number = 100;

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.LIGHTNING];

  public hp: number = 60;

  public weakness: Weakness[] = [{ type: CardType.FIGHTING }];

  public retreat = [CardType.COLORLESS];

  public attacks = [{
    name: 'Tumbling Attack',
    cost: [CardType.LIGHTNING],
    damage: 10,
    text: 'Flip a coin. If heads, this attack does 20 more damage.'
  }];

  public set: string = 'MEW';

  public name: string = 'Voltorb';

  public fullName: string = 'Voltorb MEW';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Tumbling Attack
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;

      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], result => {
        if (result === true) {
          effect.damage += 20;
        }
      });
    }

    return state;
  }

}
