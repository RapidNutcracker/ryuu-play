import { Effect } from '../../../game/store/effects/effect';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Resistance } from '../../../game/store/card/pokemon-types';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { State } from '../../../game/store/state/state';
import { StoreLike } from '../../../game/store/store-like';

export class Pidgeotto extends PokemonCard {

  public id: number = 17;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Pidgey';

  public cardTypes: CardType[] = [CardType.COLORLESS];

  public hp: number = 80;

  public weakness = [{ type: CardType.LIGHTNING }];

  public resistance: Resistance[] = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [];

  public attacks = [
    {
      name: 'Flap',
      cost: [CardType.COLORLESS],
      damage: 20,
      text: ''
    }
  ];

  public set: string = 'MEW';

  public name: string = 'Pidgeotto';

  public fullName: string = 'Pidgeotto MEW';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    return state;
  }
}
