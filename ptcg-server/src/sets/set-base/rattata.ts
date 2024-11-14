import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';
import { Weakness } from '../../game';

export class Rattata extends PokemonCard {

  public id: number = 61;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.COLORLESS;

  public hp: number = 30;

  public weakness: Weakness[] = [{ type: CardType.FIGHTING }];

  public resistance = [{ type: CardType.PSYCHIC, value: -30 }];

  public retreat = [];

  public attacks = [
    {
      name: 'Bite',
      cost: [CardType.COLORLESS],
      damage: 20,
      text: ''
    }
  ];

  public set: string = 'BS';

  public name: string = 'Rattata';

  public fullName: string = 'Rattata BS';

}
