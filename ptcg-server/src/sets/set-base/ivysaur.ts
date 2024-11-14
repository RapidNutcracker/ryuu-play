import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType, SpecialCondition } from '../../game/store/card/card-types';
import { StoreLike, State, Resistance, Weakness } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect } from '../../game/store/effects/game-effects';
import { AddSpecialConditionsEffect } from '../../game/store/effects/attack-effects';

export class Ivysaur extends PokemonCard {

  public id: number = 30;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Bulbasaur';

  public cardType: CardType = CardType.GRASS;

  public hp: number = 60;

  public weakness: Weakness[] = [{ type: CardType.FIRE }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: 'Vine Whip',
      cost: [CardType.GRASS, CardType.COLORLESS, CardType.COLORLESS],
      damage: 30,
      text: ''
    },
    {
      name: 'Poison Powder',
      cost: [CardType.GRASS, CardType.GRASS, CardType.GRASS],
      damage: 20,
      text: 'The Defending Pokémon is now Poisoned.'
    }
  ];

  public set: string = 'BS';

  public name: string = 'Ivysaur';

  public fullName: string = 'Ivysaur BS';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Poison Sting
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const specialConditionEffect = new AddSpecialConditionsEffect(effect, [SpecialCondition.POISONED]);
      store.reduceEffect(state, specialConditionEffect);
    }

    return state;
  }

}
