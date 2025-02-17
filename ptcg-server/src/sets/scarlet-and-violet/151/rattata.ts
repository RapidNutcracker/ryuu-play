import { AttackEffect } from '../../../game/store/effects/game-effects';
import { Effect } from '../../../game/store/effects/effect';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Resistance, State, StoreLike, Weakness } from '../../../game';
import { Stage, CardType } from '../../../game/store/card/card-types';

export class Rattata extends PokemonCard {

  public id: number = 19;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.COLORLESS;

  public hp: number = 40;

  public weakness: Weakness[] = [{ type: CardType.FIGHTING }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS];

  public attacks = [{
    name: 'Gnaw the Wound',
    cost: [CardType.COLORLESS, CardType.COLORLESS],
    damage: 20,
    text: 'This attack does 10 more damage for each damage counter on your opponent\'s Active Pokémon.'
  }];

  public set: string = 'MEW';

  public name: string = 'Rattata';

  public fullName: string = 'Rattata MEW';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Gnaw the Wound
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      effect.damage += effect.opponent.active.damage;
    }

    return state;
  }

}
