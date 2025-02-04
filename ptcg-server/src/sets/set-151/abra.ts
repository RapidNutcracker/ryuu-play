import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';
import { StoreLike, State, Resistance, Weakness } from '../../game';
import { Effect } from '../../game/store/effects/effect';

export class Abra extends PokemonCard {

  public id: number = 63;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.PSYCHIC;

  public hp: number = 50;

  public weakness: Weakness[] = [{ type: CardType.DARK }];

  public resistance: Resistance[] = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [CardType.COLORLESS];

  public attacks = [{
    name: 'Psyshot',
    cost: [CardType.PSYCHIC],
    damage: 20,
    text: ''
  }];

  public set: string = 'MEW';

  public name: string = 'Abra';

  public fullName: string = 'Abra MEW';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    return state;
  }

}
