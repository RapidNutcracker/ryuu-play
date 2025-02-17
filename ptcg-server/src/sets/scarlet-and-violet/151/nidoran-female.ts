import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, SpecialCondition } from '../../../game/store/card/card-types';
import { StoreLike, State, Resistance, Weakness } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { AddSpecialConditionsEffect } from '../../../game/store/effects/attack-effects';

export class NidoranFemale extends PokemonCard {

  public id: number = 29;

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.DARKNESS];

  public hp: number = 60;

  public weakness: Weakness[] = [{ type: CardType.FIGHTING }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: 'Poison Horn',
      cost: [CardType.DARKNESS, CardType.COLORLESS],
      damage: 20,
      text: 'Your opponent\'s Active Pokémon is now Poisoned.'
    }
  ];

  public set: string = 'MEW';

  public name: string = 'Nidoran Female';

  public fullName: string = 'Nidoran Female MEW';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Poison Horn
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const specialConditionEffect = new AddSpecialConditionsEffect(effect, [SpecialCondition.POISONED]);
      store.reduceEffect(state, specialConditionEffect);
    }

    return state;
  }
}
