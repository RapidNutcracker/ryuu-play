import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, SpecialCondition } from '../../../game/store/card/card-types';
import { StoreLike, State } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { AddSpecialConditionsEffect } from '../../../game/store/effects/attack-effects';

export class Primeape extends PokemonCard {

  public id: number = 57;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Mankey';

  public cardTypes: CardType[] = [CardType.FIGHTING];

  public hp: number = 120;

  public weakness = [{ type: CardType.PSYCHIC }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [{
    name: 'Rant and Rave',
    cost: [CardType.FIGHTING],
    damage: 40,
    text: 'This Pokémon is now Confused.'
  }, {
    name: 'Raging Smash',
    cost: [CardType.FIGHTING, CardType.COLORLESS, CardType.COLORLESS],
    damage: 150,
    text: 'If this Pokémon isn\'t Confused, this attack does nothing.'
  }];

  public set: string = 'MEW';

  public name: string = 'Primeape';

  public fullName: string = 'Primeape MEW';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Rant and Rave
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const specialConditionEffect = new AddSpecialConditionsEffect(effect, [SpecialCondition.CONFUSED]);
      specialConditionEffect.target = effect.player.active;
      state = store.reduceEffect(state, specialConditionEffect);

      return state;
    }

    // Raging Smash
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      if (!effect.player.active.specialConditions.includes(SpecialCondition.CONFUSED)) {
        effect.preventDefault = true;
      }

      return state;
    }

    return state;
  }
}
