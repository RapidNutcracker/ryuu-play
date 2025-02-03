import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';
import { StoreLike, State, Resistance, Weakness } from '../../game';
import { Effect } from '../../game/store/effects/effect';

export class Nidorino extends PokemonCard {

  public id: number = 33;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Nidoran Male';

  public cardType: CardType = CardType.DARK;

  public hp: number = 90;

  public weakness: Weakness[] = [{ type: CardType.FIGHTING }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: 'Sharp Fang',
      cost: [CardType.DARK],
      damage: 30,
      text: ''
    },
    {
      name: 'Superpowered Horns',
      cost: [CardType.DARK, CardType.DARK, CardType.COLORLESS],
      damage: 100,
      text: ''
    }
  ];

  public set: string = 'MEW';

  public name: string = 'Nidorino';

  public fullName: string = 'Nidorino MEW';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    return state;
  }

}
