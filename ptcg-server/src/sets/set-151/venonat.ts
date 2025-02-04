import { Effect } from '../../game/store/effects/effect';
import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Resistance } from '../../game/store/card/pokemon-types';
import { Stage, CardType } from '../../game/store/card/card-types';
import { State } from '../../game/store/state/state';
import { StoreLike } from '../../game/store/store-like';

export class Venonat extends PokemonCard {

  public id: number = 48;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.GRASS;

  public hp: number = 70;

  public weakness = [{ type: CardType.FIRE }];

  public resistance: Resistance[] = [];

  public retreat: CardType[] = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [{
    name: 'Gnaw',
    cost: [CardType.COLORLESS],
    damage: 10,
    text: ''
  }, {
    name: 'Beam',
    cost: [CardType.GRASS, CardType.COLORLESS, CardType.COLORLESS],
    damage: 40,
    text: ''
  }];

  public set: string = 'MEW';

  public name: string = 'Venonat';

  public fullName: string = 'Venonat MEW';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    return state;
  }
}
