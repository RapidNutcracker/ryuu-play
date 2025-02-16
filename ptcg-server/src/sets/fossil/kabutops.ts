import { Effect } from '../../game/store/effects/effect';
import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Resistance, Weakness } from '../../game/store/card/pokemon-types';
import { Stage, CardType } from '../../game/store/card/card-types';
import { State } from '../../game/store/state/state';
import { StoreLike } from '../../game/store/store-like';
import { AfterDamageEffect } from '../../game/store/effects/attack-effects';
import { HealEffect } from '../../game/store/effects/game-effects';

export class Kabutops extends PokemonCard {

  public id: number = 9;

  public stage: Stage = Stage.STAGE_2;

  public evolvesFrom: string = 'Kabuto';

  public cardType: CardType = CardType.FIGHTING;

  public hp: number = 60;

  public weakness: Weakness[] = [{ type: CardType.GRASS }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS];

  public attacks = [{
    name: 'Whirlwind',
    cost: [CardType.FIGHTING, CardType.FIGHTING],
    damage: 30,
    text: ''
  }, {
    name: 'Absorb',
    cost: [CardType.FIGHTING, CardType.FIGHTING, CardType.FIGHTING, CardType.FIGHTING],
    damage: 40,
    text:
      'Remove a number of damage counters from Kabutops equal to half the damage done to the ' +
      'Defending Pokémon (after applying Weakness and Resistance) (rounded up to the nearest 10).' +
      'If Kabutops has fewer damage counters than that, remove all of them.'
  }];

  public set: string = 'FO';

  public name: string = 'Kabutops';

  public fullName: string = 'Kabutops FO';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Absorb
    if (effect instanceof AfterDamageEffect && effect.attack === this.attacks[1]) {
      const healAmount = Math.ceil((effect.damage / 2) / 10) * 10;

      const healEffect = new HealEffect(effect.player, effect.source, healAmount);
      state = store.reduceEffect(state, healEffect);
    }

    return state;
  }

}
