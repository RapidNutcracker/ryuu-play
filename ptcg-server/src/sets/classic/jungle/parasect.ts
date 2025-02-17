import { AttackEffect } from '../../../game/store/effects/game-effects';
import { Effect } from '../../../game/store/effects/effect';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Resistance, Weakness } from '../../../game/store/card/pokemon-types';
import { Stage, CardType, SpecialCondition } from '../../../game/store/card/card-types';
import { State } from '../../../game/store/state/state';
import { StoreLike } from '../../../game/store/store-like';
import { AddSpecialConditionsEffect } from '../../../game/store/effects/attack-effects';

export class Parasect extends PokemonCard {

  public id: number = 41;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Paras';

  public cardType: CardType = CardType.GRASS;

  public hp: number = 60;

  public weakness: Weakness[] = [{ type: CardType.FIRE }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS];

  public attacks = [{
    name: 'Spore',
    cost: [CardType.GRASS, CardType.GRASS],
    damage: 0,
    text:
      'The Defending Pokémon is now Asleep.'
  }, {
    name: 'Slash',
    cost: [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS],
    damage: 30,
    text: ''
  }];

  public set: string = 'JU';

  public name: string = 'Parasect';

  public fullName: string = 'Parasect JU';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Spore
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const specialConditionEffect = new AddSpecialConditionsEffect(effect, [SpecialCondition.ASLEEP]);
      store.reduceEffect(state, specialConditionEffect);
    }

    return state;
  }
}
