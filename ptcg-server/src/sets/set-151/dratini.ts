import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';

export class Dratini extends PokemonCard {

  public id: number = 147;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.DRAGON;

  public hp: number = 60;

  public retreat = [CardType.COLORLESS];

  public attacks = [{
    name: 'Beat',
    cost: [CardType.WATER],
    damage: 10,
    text: ''
  }, {
    name: 'Draconic Whip',
    cost: [CardType.WATER, CardType.LIGHTNING],
    damage: 40,
    text: ''
  }];

  public set: string = 'MEW';

  public name: string = 'Dratini';

  public fullName: string = 'Dratini MEW';

}
