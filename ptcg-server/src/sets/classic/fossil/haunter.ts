import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, SpecialCondition } from '../../../game/store/card/card-types';
import { StoreLike, State, Resistance, GameError, GameMessage, Power, PowerType, CoinFlipPrompt, GamePhase } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect, PowerEffect } from '../../../game/store/effects/game-effects';
import { AbstractAttackEffect, AddSpecialConditionsEffect } from '../../../game/store/effects/attack-effects';

export class Haunter extends PokemonCard {

  public id: number = 6;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Gastly';

  public cardTypes: CardType[] = [CardType.PSYCHIC];

  public hp: number = 60;

  public weakness = [];

  public resistance: Resistance[] = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [];

  public powers: Power[] = [{
    name: 'Transparency',
    powerType: PowerType.POKEMON_POWER,
    text:
      'Whenever an attack does anything to Haunter, flip a coin. ' +
      'If heads, prevent all effects of that attack, including damage, done to Haunter.' +
      'This power stops working while Haunter is Asleep, Confused, or Paralyzed.'
  }];

  public attacks = [{
    name: 'Nightmare',
    cost: [CardType.PSYCHIC, CardType.COLORLESS],
    damage: 10,
    text: 'The Defending Pokémon is now Asleep.'
  }];

  public set: string = 'FO';

  public name: string = 'Haunter';

  public fullName: string = 'Haunter FO';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Transparency
    if (effect instanceof AbstractAttackEffect && effect.target.getPokemonCard() === this) {
      // Try to reduce PowerEffect, to check if something is blocking our ability
      try {
        const powerEffect = new PowerEffect(effect.opponent, this.powers[0], this);
        state = store.reduceEffect(state, powerEffect);

        if ([
          SpecialCondition.ASLEEP,
          SpecialCondition.CONFUSED,
          SpecialCondition.PARALYZED
        ].some(specialCondition =>
          effect.target.specialConditions.includes(specialCondition)
        )) {
          throw new GameError(GameMessage.BLOCKED_BY_SPECIAL_CONDITION);
        }
      } catch {
        return state;
      }

      if (state.phase !== GamePhase.ATTACK) {
        return state;
      }

      return store.prompt(state, [
        new CoinFlipPrompt(effect.opponent.id, GameMessage.COIN_FLIP)
      ], result => {
        if (result === true) {
          effect.preventDefault = true;
        }
      });
    }

    // Nightmare
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const specialConditionEffect = new AddSpecialConditionsEffect(effect, [SpecialCondition.ASLEEP]);
      store.reduceEffect(state, specialConditionEffect);
    }

    return state;
  }
}
