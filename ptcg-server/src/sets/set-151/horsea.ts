import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';
import { StoreLike, State, Resistance, Weakness, Attack, Power } from '../../game';
import { Effect } from '../../game/store/effects/effect';

export class Horsea extends PokemonCard {

  public id: number = 116;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.WATER;

  public hp: number = 60;

  public weakness: Weakness[] = [{ type: CardType.LIGHTNING }];

  public resistance: Resistance[] = [];

  public retreat: CardType[] = [CardType.COLORLESS];

  public powers: Power[] = [];

  public attacks: Attack[] = [{
    name: 'Rain Splash',
    cost: [CardType.WATER],
    damage: 10,
    text: ''
  }, {
    name: 'Sharp Fin',
    cost: [CardType.WATER, CardType.COLORLESS, CardType.COLORLESS],
    damage: 40,
    text: ''
  }];

  public set: string = 'MEW';

  public name: string = 'Horsea';

  public fullName: string = 'Horsea MEW';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    return state;
  }

}
