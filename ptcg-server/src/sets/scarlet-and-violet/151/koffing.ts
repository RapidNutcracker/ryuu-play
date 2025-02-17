import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, SpecialCondition } from '../../../game/store/card/card-types';
import { StoreLike, State } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { AddSpecialConditionsEffect } from '../../../game/store/effects/attack-effects';

export class Koffing extends PokemonCard {

  public id: number = 109;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.DARKNESS;

  public hp: number = 60;

  public weakness = [{ type: CardType.FIGHTING }];

  public retreat = [CardType.COLORLESS];

  public attacks = [{
    name: 'Suspicious Gas',
    cost: [CardType.COLORLESS, CardType.COLORLESS],
    damage: 20,
    text: 'Your opponent\'s Active Pokémon is now Confused.'
  }];

  public set: string = 'MEW';

  public name: string = 'Koffing';

  public fullName: string = 'Koffing MEW';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Suspicious Gas
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const specialConditionEffect = new AddSpecialConditionsEffect(effect, [SpecialCondition.CONFUSED]);
      return store.reduceEffect(state, specialConditionEffect);
    }

    return state;
  }
}
