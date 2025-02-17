import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, Resistance, Weakness } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';

export class Weedle extends PokemonCard {

  public id: number = 13;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.GRASS;

  public hp: number = 50;

  public weakness: Weakness[] = [{ type: CardType.FIRE }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: 'Ram',
      cost: [CardType.GRASS],
      damage: 10,
      text: ''
    },
    {
      name: 'Bug Bite',
      cost: [CardType.COLORLESS, CardType.COLORLESS],
      damage: 20,
      text: ''
    }
  ];

  public set: string = 'MEW';

  public name: string = 'Weedle';

  public fullName: string = 'Weedle MEW';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    return state;
  }

}
