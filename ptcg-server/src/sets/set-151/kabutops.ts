import { Effect } from '../../game/store/effects/effect';
import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';
import {
  StoreLike,
  State,
  Resistance,
  Weakness,
  Attack,
  Power,
  PowerType
} from '../../game';
import { AfterDamageEffect, HealTargetEffect } from '../../game/store/effects/attack-effects';

export class Kabutops extends PokemonCard {

  public id: number = 141;

  public stage: Stage = Stage.STAGE_2;

  public evolvesFrom: string = 'Kabuto';

  public cardType: CardType = CardType.FIGHTING;

  public hp: number = 160;

  public weakness: Weakness[] = [{ type: CardType.LIGHTNING }];

  public resistance: Resistance[] = [];

  public retreat: CardType[] = [CardType.COLORLESS, CardType.COLORLESS];

  public powers: Power[] = [{
    name: 'Ancient Way',
    powerType: PowerType.ABILITY,
    text: 'Apply Weakness for your opponent\'s Active Pokémon as ×4 instead.'
  }];

  public attacks: Attack[] = [{
    name: 'Draining Blade',
    cost: [CardType.FIGHTING, CardType.COLORLESS, CardType.COLORLESS],
    damage: 100,
    text:
      'Heal 30 damage from this Pokémon.'
  }];

  public set: string = 'MEW';

  public name: string = 'Kabutops';

  public fullName: string = 'Kabutops MEW';

  public readonly ANCIENT_WAY_MARKER = 'ANCIENT_WAY_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    /// TODO: Ancient Way

    // Draining Blade
    if (effect instanceof AfterDamageEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      const healEffect = new HealTargetEffect(effect.attackEffect, 30);
      healEffect.target = player.active;
      return store.reduceEffect(state, healEffect);
    }

    return state;
  }

}
