import { Effect } from '../../game/store/effects/effect';
import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Resistance } from '../../game/store/card/pokemon-types';
import { Stage, CardType, SpecialCondition } from '../../game/store/card/card-types';
import { State } from '../../game/store/state/state';
import { StoreLike } from '../../game/store/store-like';
import { AttackEffect } from '../../game/store/effects/game-effects';
import { AddSpecialConditionsEffect } from '../../game/store/effects/attack-effects';

export class Paras extends PokemonCard {

  public id: number = 46;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.GRASS;

  public hp: number = 70;

  public weakness = [{ type: CardType.FIRE }];

  public resistance: Resistance[] = [];

  public retreat: CardType[] = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [{
    name: 'Stampede',
    cost: [CardType.GRASS],
    damage: 10,
    text: ''
  }, {
    name: 'Spore Ball',
    cost: [CardType.GRASS, CardType.COLORLESS],
    damage: 20,
    text: 'Your opponent\'s Active Pokémon is now Asleep.'
  }];

  public set: string = 'MEW';

  public name: string = 'Paras';

  public fullName: string = 'Paras MEW';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Spore Ball
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const specialConditionEffect = new AddSpecialConditionsEffect(effect, [SpecialCondition.ASLEEP]);
      store.reduceEffect(state, specialConditionEffect);
    }

    return state;
  }
}
