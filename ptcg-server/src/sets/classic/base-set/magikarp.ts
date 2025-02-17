import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';

export class Magikarp extends PokemonCard {

  public id: number = 34;

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.WATER];

  public hp: number = 30;

  public weakness = [{ type: CardType.LIGHTNING }];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: 'Tackle',
      cost: [CardType.COLORLESS],
      damage: 10,
      text: ''
    },
    {
      name: 'Flail',
      cost: [CardType.WATER],
      damage: 10,
      text: 'Does 10 damage times the number of damage counters on Magikarp.'
    }
  ];

  public set: string = 'BS';

  public name: string = 'Magikarp';

  public fullName: string = 'Magikarp BS';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Flail
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      effect.damage *= effect.player.active.damage;
      return state;
    }

    return state;
  }
}
