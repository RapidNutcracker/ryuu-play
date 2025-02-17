import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';

export class Seel extends PokemonCard {

  public id: number = 41;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.WATER;

  public hp: number = 60;

  public resistance = [];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: 'Headbutt',
      cost: [CardType.WATER],
      damage: 10,
      text: ''
    }
  ];

  public set: string = 'BS';

  public name: string = 'Seel';

  public fullName: string = 'Seel BS';

}
