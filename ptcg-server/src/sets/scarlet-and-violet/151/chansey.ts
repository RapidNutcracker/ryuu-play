import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, Resistance, Power, PowerType } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';

export class Chansey extends PokemonCard {

  public id: number = 113;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.COLORLESS;

  public hp: number = 110;

  public weakness = [{ type: CardType.FIGHTING }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public powers: Power[] = [{
    name: 'Lucky Bonus',
    powerType: PowerType.ABILITY,
    useFromHand: true,
    text:
      'If you took this Pokémon as a face-down Prize card during your turn ' +
      'and your Bench isn\'t full, before you put it into your hand, you may put it onto your Bench. ' +
      'If you put this Pokémon onto your Bench in this way, flip a coin. If heads, take 1 more Prize card.'
  }];

  public attacks = [{
    name: 'Gentle Slap',
    cost: [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS],
    damage: 70,
    text: ''
  }];

  public set: string = 'MEW';

  public name: string = 'Chansey';

  public fullName: string = 'Chansey MEW';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    /// TODO: Lucky Bonus

    return state;
  }

}
