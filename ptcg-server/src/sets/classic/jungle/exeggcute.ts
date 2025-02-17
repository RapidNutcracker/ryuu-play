import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, SpecialCondition } from '../../../game/store/card/card-types';
import { StoreLike, State, Resistance, Weakness } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AddSpecialConditionsEffect, AfterDamageEffect, HealTargetEffect } from '../../../game/store/effects/attack-effects';
import { AttackEffect } from '../../../game/store/effects/game-effects';

export class Exeggcute extends PokemonCard {

  public id: number = 52;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.GRASS;

  public hp: number = 50;

  public weakness: Weakness[] = [{ type: CardType.FIRE }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS];

  public attacks = [{
    name: 'Hypnosis',
    cost: [CardType.PSYCHIC],
    damage: 0,
    text: 'The Defending Pokémon is now Asleep.'
  }, {
    name: 'Leech Seed',
    cost: [CardType.GRASS, CardType.GRASS],
    damage: 20,
    text: 'Unless all damage from this attack is prevented, you may remove 1 damage counter from Exeggcute.'
  }];

  public set: string = 'JU';

  public name: string = 'Exeggcute';

  public fullName: string = 'Exeggcute JU';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Hypnosis
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const specialConditionEffect = new AddSpecialConditionsEffect(effect, [SpecialCondition.ASLEEP]);
      store.reduceEffect(state, specialConditionEffect);
    }

    // Leech Seed
    if (effect instanceof AfterDamageEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;

      if (effect.damage > 0) {
        const healEffect = new HealTargetEffect(effect.attackEffect, 10);
        healEffect.target = player.active;
        return store.reduceEffect(state, healEffect);
      }
    }

    return state;
  }

}
