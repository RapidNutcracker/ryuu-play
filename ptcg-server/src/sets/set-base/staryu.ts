import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';
import { Weakness } from '../../game';

export class Staryu extends PokemonCard {

  public id: number = 65;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.WATER;

  public hp: number = 40;

  public weakness: Weakness[] = [{ type: CardType.LIGHTNING }];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: 'Slap',
      cost: [CardType.WATER],
      damage: 20,
      text: ''
    }
  ];

  public set: string = 'BS';

  public name: string = 'Staryu';

  public fullName: string = 'Staryu BS';

}
