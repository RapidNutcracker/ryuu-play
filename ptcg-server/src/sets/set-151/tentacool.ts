import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';
import { StoreLike, State, Resistance, Weakness, Attack, Power } from '../../game';
import { Effect } from '../../game/store/effects/effect';

export class Tentacool extends PokemonCard {

  public id: number = 72;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.WATER;

  public hp: number = 60;

  public weakness: Weakness[] = [{ type: CardType.LIGHTNING }];

  public resistance: Resistance[] = [];

  public retreat: CardType[] = [CardType.COLORLESS];

  public powers: Power[] = [];

  public attacks: Attack[] = [{
    name: 'Tingle',
    cost: [CardType.WATER],
    damage: 10,
    text: ''
  }, {
    name: 'Watering',
    cost: [CardType.COLORLESS, CardType.COLORLESS],
    damage: 20,
    text: ''
  }];

  public set: string = 'MEW';

  public name: string = 'Tentacool';

  public fullName: string = 'Tentacool MEW';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    return state;
  }

}
