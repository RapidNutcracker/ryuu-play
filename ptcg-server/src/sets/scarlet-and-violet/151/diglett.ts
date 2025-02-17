import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';

export class Diglett extends PokemonCard {

  public id: number = 50;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.FIGHTING;

  public hp: number = 50;

  public weakness = [{ type: CardType.GRASS }];

  public resistance = [];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: 'Headbutt Bounce',
      cost: [CardType.FIGHTING],
      damage: 10,
      text: ''
    },
    {
      name: 'Mud-Slap',
      cost: [CardType.FIGHTING, CardType.FIGHTING],
      damage: 30,
      text: ''
    }
  ];

  public set: string = 'MEW';

  public name: string = 'Diglett';

  public fullName: string = 'Diglett MEW';

}
