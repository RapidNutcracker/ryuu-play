import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, Resistance, Weakness } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';

export class Kingler extends PokemonCard {

  public id: number = 99;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Krabby';

  public cardTypes: CardType[] = [CardType.WATER];

  public hp: number = 140;

  public weakness: Weakness[] = [{ type: CardType.LIGHTNING }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: 'Hammer Arm',
      cost: [CardType.WATER, CardType.WATER, CardType.WATER],
      damage: 90,
      text: 'Discard the top card of your opponent\'s deck.'
    },
    {
      name: 'Guillotine',
      cost: [CardType.WATER, CardType.WATER, CardType.WATER, CardType.WATER],
      damage: 220,
      text: ''
    },
  ];

  public set: string = 'MEW';

  public name: string = 'Kingler';

  public fullName: string = 'Kingler MEW';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Hammer Arm
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const opponent = effect.opponent;
      opponent.deck.moveTo(opponent.discard, 1);
      return state;
    }

    return state;
  }

}
