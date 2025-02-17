import { AttackEffect } from '../../../game/store/effects/game-effects';
import { Effect } from '../../../game/store/effects/effect';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Resistance, Weakness } from '../../../game/store/card/pokemon-types';
import { Stage, CardType, SpecialCondition } from '../../../game/store/card/card-types';
import { State } from '../../../game/store/state/state';
import { StoreLike } from '../../../game/store/store-like';
import { AddSpecialConditionsEffect } from '../../../game/store/effects/attack-effects';

export class Paras extends PokemonCard {

  public id: number = 59;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.GRASS;

  public hp: number = 40;

  public weakness: Weakness[] = [{ type: CardType.FIRE }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS];

  public attacks = [{
    name: 'Scratch',
    cost: [CardType.COLORLESS, CardType.COLORLESS],
    damage: 20,
    text: ''
  }, {
    name: 'Spore',
    cost: [CardType.GRASS, CardType.GRASS],
    damage: 0,
    text:
      'The Defending Pokémon is now Asleep.'
  }];

  public set: string = 'JU';

  public name: string = 'Paras';

  public fullName: string = 'Paras JU';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Spore
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const specialConditionEffect = new AddSpecialConditionsEffect(effect, [SpecialCondition.ASLEEP]);
      store.reduceEffect(state, specialConditionEffect);
    }

    return state;
  }
}
