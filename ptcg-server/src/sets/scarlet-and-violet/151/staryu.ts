import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { State, StoreLike, Weakness } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';

export class Staryu extends PokemonCard {

  public id: number = 120;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.WATER;

  public hp: number = 60;

  public weakness: Weakness[] = [{ type: CardType.LIGHTNING }];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: 'Swift',
      cost: [CardType.WATER],
      damage: 20,
      text: 'This attack\'s damage isn\'t affected by Weakness or Resistance, or by any effects on your opponent\'s Active Pokémon.'
    }
  ];

  public set: string = 'MEW';

  public name: string = 'Staryu';

  public fullName: string = 'Staryu MEW';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      effect.ignoreWeakness = true;
      effect.ignoreResistance = true;
    }

    return state;
  }
}
