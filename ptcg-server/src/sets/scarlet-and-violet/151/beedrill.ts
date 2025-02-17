import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, SpecialCondition } from '../../../game/store/card/card-types';
import { StoreLike, State, Resistance, Weakness } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { AddSpecialConditionsEffect } from '../../../game/store/effects/attack-effects';

export class Beedrill extends PokemonCard {

  public id: number = 15;

  public stage: Stage = Stage.STAGE_2;

  public evolvesFrom: string = 'Kakuna';

  public cardTypes: CardType[] = [CardType.GRASS];

  public hp: number = 130;

  public weakness: Weakness[] = [{ type: CardType.FIRE }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: 'Nadir Needle',
      cost: [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS],
      damage: 30,
      text:
        'If you have no cards in your hand, this attack does 120 more damage, ' +
        'and your opponent\'s Active Pokémon is now Paralyzed and Poisoned.'
    },
    {
      name: 'Pierce',
      cost: [CardType.GRASS, CardType.GRASS],
      damage: 110,
      text: ''
    }
  ];

  public set: string = 'MEW';

  public name: string = 'Beedrill';

  public fullName: string = 'Beedrill MEW';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Nadir Needle
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      if (player.hand.cards.length === 0) {
        effect.damage += 120;

        const specialConditionEffect = new AddSpecialConditionsEffect(effect, [SpecialCondition.PARALYZED, SpecialCondition.POISONED]);
        store.reduceEffect(state, specialConditionEffect);
      }
    }

    return state;
  }

}
