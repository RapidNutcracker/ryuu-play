import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, Resistance, Weakness, Attack, Power } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';

export class Weepinbell extends PokemonCard {

  public id: number = 70;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Bellsprout';

  public cardTypes: CardType[] = [CardType.GRASS];

  public hp: number = 90;

  public weakness: Weakness[] = [{ type: CardType.FIRE }];

  public resistance: Resistance[] = [];

  public retreat: CardType[] = [CardType.COLORLESS, CardType.COLORLESS];

  public powers: Power[] = [];

  public attacks: Attack[] = [{
    name: 'Cut',
    cost: [CardType.GRASS],
    damage: 30,
    text: ''
  }, {
    name: 'Spray Fluid',
    cost: [CardType.GRASS, CardType.COLORLESS],
    damage: 50,
    text: ''
  }];

  public set: string = 'MEW';

  public name: string = 'Weepinbell';

  public fullName: string = 'Weepinbell MEW';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    return state;
  }

}
