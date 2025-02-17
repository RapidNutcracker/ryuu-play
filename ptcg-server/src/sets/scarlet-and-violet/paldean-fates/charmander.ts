import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, StateUtils } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';

export class Charmander extends PokemonCard {

  public id: number = 7;

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.FIRE];

  public hp: number = 70;

  public weakness = [{ type: CardType.WATER }];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: 'Blazing Destruction',
      cost: [CardType.FIRE],
      damage: 0,
      text: 'Discard a Stadium in play.'
    },
    {
      name: 'Steady Firebreathing',
      cost: [CardType.FIRE, CardType.FIRE],
      damage: 30,
      text: ''
    },
  ];

  public set: string = 'PAF';

  public name: string = 'Charmander';

  public fullName: string = 'Charmander PAF';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Blazing Desctruction
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const stadiumCard = StateUtils.getStadiumCard(state);
      if (stadiumCard !== undefined) {
        const cardList = StateUtils.findCardList(state, stadiumCard);
        const stadiumOwner = StateUtils.findOwner(state, cardList);
        cardList.moveTo(stadiumOwner.discard);
      }
    }

    return state;
  }
}
