import { Effect } from '../../../game/store/effects/effect';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import {
  StoreLike,
  State,
  Resistance
} from '../../../game';

export class Aron3 extends PokemonCard {

  public id: number = 50;

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.METAL];

  public hp: number = 50;

  public weakness = [{ type: CardType.FIRE }];

  public resistance: Resistance[] = [{ type: CardType.GRASS, value: -30 }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [{
    name: 'Gnaw',
    cost: [CardType.COLORLESS],
    damage: 10,
    text: ''
  }];

  public set: string = 'RS';

  public name: string = 'Aron';

  public fullName: string = '#50 Aron RS';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    return state;
  }
}
