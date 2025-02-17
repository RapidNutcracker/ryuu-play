import { Effect } from '../../../game/store/effects/effect';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Attack, Resistance } from '../../../game/store/card/pokemon-types';
import { Stage, CardType, SpecialCondition } from '../../../game/store/card/card-types';
import { State } from '../../../game/store/state/state';
import { StoreLike } from '../../../game/store/store-like';
import { AddSpecialConditionsEffect, AfterDamageEffect } from '../../../game/store/effects/attack-effects';

export class Gloom extends PokemonCard {

  public id: number = 37;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Oddish';

  public cardTypes: CardType[] = [CardType.GRASS];

  public hp: number = 60;

  public weakness = [{ type: CardType.FIRE }];

  public resistance: Resistance[] = [];

  public retreat: CardType[] = [CardType.COLORLESS];

  public attacks: Attack[] = [{
    name: 'Poisonpowder',
    cost: [CardType.GRASS],
    damage: 0,
    text: 'The Defending Pokémon is now Poisoned.'
  }, {
    name: 'Foul Odor',
    cost: [CardType.GRASS, CardType.GRASS],
    damage: 20,
    text: 'Both the Defending Pokémon and Gloom are now Confused (after doing damage).'
  }];

  public set: string = 'JU';

  public name: string = 'Gloom';

  public fullName: string = 'Gloom JU';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Poisonpowder
    if (effect instanceof AfterDamageEffect && effect.source.cards.includes(this)) {

      const addSpecialConditionsEffect = new AddSpecialConditionsEffect(effect.attackEffect, [SpecialCondition.POISONED]);
      state = store.reduceEffect(state, addSpecialConditionsEffect);

      return state;
    }

    // Foul Odor
    if (effect instanceof AfterDamageEffect && effect.source.cards.includes(this)) {

      const addSpecialConditionsEffect = new AddSpecialConditionsEffect(effect.attackEffect, [SpecialCondition.CONFUSED]);
      state = store.reduceEffect(state, addSpecialConditionsEffect);

      addSpecialConditionsEffect.target = effect.source;
      state = store.reduceEffect(state, addSpecialConditionsEffect);

      return state;
    }

    return state;
  }
}
