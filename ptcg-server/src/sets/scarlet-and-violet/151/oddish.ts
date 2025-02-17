import { Effect } from '../../../game/store/effects/effect';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Resistance } from '../../../game/store/card/pokemon-types';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { State } from '../../../game/store/state/state';
import { StoreLike } from '../../../game/store/store-like';

export class Oddish extends PokemonCard {

  public id: number = 42;

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.GRASS];

  public hp: number = 60;

  public weakness = [{ type: CardType.FIRE }];

  public resistance: Resistance[] = [];

  public retreat: CardType[] = [CardType.COLORLESS];

  public attacks = [{
    name: 'Razor Leaf',
    cost: [CardType.COLORLESS, CardType.COLORLESS],
    damage: 20,
    text: ''
  }];

  public set: string = 'MEW';

  public name: string = 'Oddish';

  public fullName: string = 'Oddish MEW';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    return state;
  }
}
