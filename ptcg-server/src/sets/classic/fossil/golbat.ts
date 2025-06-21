import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, Resistance } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { HealEffect } from '../../../game/store/effects/game-effects';
import { AfterDamageEffect } from '../../../game/store/effects/attack-effects';

export class Golbat extends PokemonCard {

  public id: number = 34;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom = 'Zubat';

  public cardTypes: CardType[] = [CardType.GRASS];

  public hp: number = 60;

  public weakness = [{ type: CardType.PSYCHIC }];

  public resistance: Resistance[] = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [];

  public attacks = [{
    name: 'Wing Attack',
    cost: [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS],
    damage: 30,
    text: ''
  }, {
    name: 'Leech Life',
    cost: [CardType.GRASS, CardType.GRASS, CardType.COLORLESS],
    damage: 20,
    text:
      'Remove a number of damage counters from Golbat equal to the damage done to the Defending Pokémon (after applying Weakness and Resistance). ' +
      'If Golbat has fewer damage counters than that, remove all of them.'
  }];

  public set: string = 'FO';

  public name: string = 'Golbat';

  public fullName: string = 'Golbat FO';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Poison Fang
    if (effect instanceof AfterDamageEffect && effect.attack === this.attacks[1]) {
      const healEffect = new HealEffect(effect.player, effect.source, effect.damage);
      store.reduceEffect(state, healEffect);
    }

    return state;
  }
}
