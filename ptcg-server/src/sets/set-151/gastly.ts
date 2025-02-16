import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';
import { StoreLike, State, Resistance, Weakness } from '../../game';
import { Effect } from '../../game/store/effects/effect';

export class Gastly extends PokemonCard {

  public id: number = 92;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.PSYCHIC;

  public hp: number = 50;

  public weakness: Weakness[] = [{ type: CardType.DARKNESS }];

  public resistance: Resistance[] = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [CardType.COLORLESS];

  public attacks = [{
    name: 'Suffocating Gas',
    cost: [CardType.PSYCHIC],
    damage: 20,
    text: ''
  }];

  public set: string = 'MEW';

  public name: string = 'Gastly';

  public fullName: string = 'Gastly MEW';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    return state;
  }
}
