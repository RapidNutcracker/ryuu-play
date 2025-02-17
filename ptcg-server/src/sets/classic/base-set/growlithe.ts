import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';

export class Growlithe extends PokemonCard {

  public id: number = 28;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.FIRE;

  public hp: number = 60;

  public weakness = [{ type: CardType.WATER }];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: 'Flare',
      cost: [CardType.FIRE, CardType.COLORLESS],
      damage: 20,
      text: ''
    }
  ];

  public set: string = 'BS';

  public name: string = 'Growlithe';

  public fullName: string = 'Growlithe BS';

}
