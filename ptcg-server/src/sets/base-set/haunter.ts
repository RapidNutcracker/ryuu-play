import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType, SpecialCondition } from '../../game/store/card/card-types';
import { StoreLike, State, Resistance, StateUtils, GameError, GameMessage } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect } from '../../game/store/effects/game-effects';
import { AddSpecialConditionsEffect } from '../../game/store/effects/attack-effects';

export class Haunter extends PokemonCard {

  public id: number = 29;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Gastly';

  public cardType: CardType = CardType.PSYCHIC;

  public hp: number = 60;

  public weakness = [];

  public resistance: Resistance[] = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: 'Hypnosis',
      cost: [CardType.PSYCHIC],
      damage: 0,
      text: 'The Defending Pokémon is now Asleep.'
    },
    {
      name: 'Dream Eater',
      cost: [CardType.PSYCHIC, CardType.PSYCHIC],
      damage: 50,
      text: 'You can\'t use this attack unless the Defending Pokémon is Asleep.'
    }
  ];

  public set: string = 'BS';

  public name: string = 'Haunter';

  public fullName: string = 'Haunter BS';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Hypnosis
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const specialConditionEffect = new AddSpecialConditionsEffect(effect, [SpecialCondition.ASLEEP]);
      store.reduceEffect(state, specialConditionEffect);
    }

    // Dream Eater
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      const isOpponentAsleep = opponent.active.specialConditions.includes(SpecialCondition.ASLEEP);

      if (!isOpponentAsleep) {
        throw new GameError(GameMessage.CANNOT_USE_ATTACK);
      }
    }

    return state;
  }
}
