import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, Resistance, Weakness, Attack } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';

export class Seaking extends PokemonCard {

  public id: number = 46;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Goldeen';

  public cardTypes: CardType[] = [CardType.WATER];

  public hp: number = 70;

  public weakness: Weakness[] = [{ type: CardType.LIGHTNING }];

  public resistance: Resistance[] = [];

  public retreat: CardType[] = [CardType.COLORLESS];

  public attacks: Attack[] = [{
    name: 'Horn Attack',
    cost: [CardType.WATER],
    damage: 10,
    text: ''
  }, {
    name: 'Waterfall',
    cost: [CardType.WATER, CardType.COLORLESS],
    damage: 30,
    text: ''
  }];

  public set: string = 'JU';

  public name: string = 'Seaking';

  public fullName: string = 'Seaking JU';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    return state;
  }

}
