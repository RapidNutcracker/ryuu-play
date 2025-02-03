import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';
import { StoreLike, State, Resistance, Weakness } from '../../game';
import { Effect } from '../../game/store/effects/effect';

export class NidoranMale extends PokemonCard {

  public id: number = 32;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.DARK;

  public hp: number = 60;

  public weakness: Weakness[] = [{ type: CardType.FIGHTING }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: 'Horn Attack',
      cost: [CardType.DARK],
      damage: 20,
      text: ''
    }
  ];

  public set: string = 'MEW';

  public name: string = 'Nidoran Male';

  public fullName: string = 'Nidoran Male MEW';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    return state;
  }

}
