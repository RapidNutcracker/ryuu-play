import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';

export class Diglett extends PokemonCard {

  public id: number = 47;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.FIGHTING;

  public hp: number = 30;

  public weakness = [{ type: CardType.GRASS }];

  public resistance = [{ type: CardType.LIGHTNING, value: -30 }];

  public retreat = [];

  public attacks = [
    {
      name: 'Dig',
      cost: [CardType.FIGHTING],
      damage: 10,
      text: ''
    },
    {
      name: 'Mud Slap',
      cost: [CardType.FIGHTING, CardType.FIGHTING],
      damage: 30,
      text: ''
    }
  ];

  public set: string = 'BS';

  public name: string = 'Diglett';

  public fullName: string = 'Diglett BS';

}
