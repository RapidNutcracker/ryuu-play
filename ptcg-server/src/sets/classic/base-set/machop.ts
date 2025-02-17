import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';

export class Machop extends PokemonCard {

  public id: number = 52;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.FIGHTING;

  public hp: number = 50;

  public weakness = [{ type: CardType.PSYCHIC }];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: 'Low Kick',
      cost: [CardType.FIGHTING],
      damage: 20,
      text: ''
    }
  ];

  public set: string = 'BS';

  public name: string = 'Machop';

  public fullName: string = 'Machop BS';

}
