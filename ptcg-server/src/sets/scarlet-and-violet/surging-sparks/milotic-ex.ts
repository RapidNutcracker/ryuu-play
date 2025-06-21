import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, CardTag, SpecialCondition } from '../../../game/store/card/card-types';
import { StoreLike } from '../../../game/store/store-like';
import { GamePhase, State } from '../../../game/store/state/state';
import { Effect } from '../../../game/store/effects/effect';
import { PowerEffect } from '../../../game/store/effects/game-effects';
import { Attack, Power, PowerType } from '../../../game/store/card/pokemon-types';
import { StateUtils } from '../../../game/store/state-utils';
import { AbstractAttackEffect, AddSpecialConditionsEffect, AfterDamageEffect } from '../../../game/store/effects/attack-effects';

export class MiloticEx extends PokemonCard {

  public id: number = 42;

  public tags: string[] = [CardTag.EX];

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Feebas';

  public cardTypes: CardType[] = [CardType.WATER];

  public hp: number = 270;

  public weakness = [{ type: CardType.LIGHTNING }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public powers: Power[] = [{
    name: 'Sparkling Scales',
    powerType: PowerType.ABILITY,
    text:
      'Prevent all damage from and effects of attacks from your opponent\'s Tera Pokémon done to this Pokémon.'
  }];

  public attacks: Attack[] = [{
    name: 'Hypno Splash',
    cost: [CardType.WATER, CardType.COLORLESS, CardType.COLORLESS],
    damage: 160,
    text: ' Your opponent\'s Active Pokémon is now Asleep.'
  }];

  public set: string = 'SSP';

  public name: string = 'Milotic ex';

  public fullName: string = 'Milotic ex SSP';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    // Sparkling Scales
    if (effect instanceof AbstractAttackEffect && effect.target.cards.includes(this)) {
      const pokemonCard = effect.target.getPokemonCard();
      const sourceCard = effect.source.getPokemonCard();

      // Card is not active, or damage source is unknown
      if (pokemonCard !== this || sourceCard === undefined) {
        return state;
      }

      // Do not ignore self-damage from Pokémon-Ex
      const player = StateUtils.findOwner(state, effect.target);
      const opponent = StateUtils.findOwner(state, effect.source);
      if (player === opponent) {
        return state;
      }

      // It's not an attack
      if (state.phase !== GamePhase.ATTACK) {
        return state;
      }

      if (sourceCard.tags.includes(CardTag.TERA)) {

        // Try to reduce PowerEffect, to check if something is blocking our ability
        try {
          const powerEffect = new PowerEffect(player, this.powers[0], this);
          store.reduceEffect(state, powerEffect);
        } catch {
          return state;
        }

        effect.preventDefault = true;
      }
    }

    // Hypno Splash
    if (effect instanceof AfterDamageEffect && effect.attack === this.attacks[0]) {
      const specialConditionEffect = new AddSpecialConditionsEffect(effect.attackEffect, [SpecialCondition.ASLEEP]);
      store.reduceEffect(state, specialConditionEffect);
    }

    return state;
  }

}
