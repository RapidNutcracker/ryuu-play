import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';
import { Weakness } from '../../game';

export class Seel extends PokemonCard {

  public id: number = 86;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.WATER;

  public hp: number = 80;

  public weakness: Weakness[] = [{ type: CardType.LIGHTNING }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: 'Chilly',
      cost: [CardType.WATER],
      damage: 20,
      text: ''
    }
  ];

  public set: string = 'MEW';

  public name: string = 'Seel';

  public fullName: string = 'Seel MEW';

}
