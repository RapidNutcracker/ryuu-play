import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, Resistance, Weakness, Attack } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';

export class Goldeen extends PokemonCard {

  public id: number = 53;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.WATER;

  public hp: number = 40;

  public weakness: Weakness[] = [{ type: CardType.LIGHTNING }];

  public resistance: Resistance[] = [];

  public retreat: CardType[] = [];

  public attacks: Attack[] = [{
    name: 'Horn Attack',
    cost: [CardType.WATER],
    damage: 10,
    text: ''
  }];

  public set: string = 'JU';

  public name: string = 'Goldeen';

  public fullName: string = 'Goldeen JU';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    return state;
  }

}
