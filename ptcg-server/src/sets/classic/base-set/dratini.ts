import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';

export class Dratini extends PokemonCard {

  public id: number = 26;

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.COLORLESS];

  public hp: number = 40;

  public resistance = [{ type: CardType.PSYCHIC, value: -30 }];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: 'Pound',
      cost: [CardType.COLORLESS],
      damage: 10,
      text: ''
    }
  ];

  public set: string = 'BS';

  public name: string = 'Dratini';

  public fullName: string = 'Dratini BS';

}
