import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';

export class Ponyta extends PokemonCard {

  public id: number = 60;

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.FIRE];

  public hp: number = 40;

  public weakness = [{ type: CardType.WATER }];

  public resistance = [];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: 'Smash Kick',
      cost: [CardType.COLORLESS, CardType.COLORLESS],
      damage: 20,
      text: ''
    },
    {
      name: 'Flame Tail',
      cost: [CardType.FIRE, CardType.FIRE],
      damage: 30,
      text: ''
    }
  ];

  public set: string = 'BS';

  public name: string = 'Ponyta';

  public fullName: string = 'Ponyta BS';

}
