import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, Resistance, Weakness } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';

export class Dugtrio extends PokemonCard {

  public id: number = 51;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Diglett';

  public cardTypes: CardType[] = [CardType.FIGHTING];

  public hp: number = 90;

  public weakness: Weakness[] = [{ type: CardType.GRASS }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS];

  public attacks = [{
    name: 'Headbutt Bounce',
    cost: [CardType.FIGHTING],
    damage: 40,
    text: ''
  }, {
    name: 'Mud Bomb',
    cost: [CardType.FIGHTING, CardType.FIGHTING],
    damage: 80,
    text: ''
  }];

  public set: string = 'MEW';

  public name: string = 'Dugtrio';

  public fullName: string = 'Dugtrio MEW';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    return state;
  }

}
