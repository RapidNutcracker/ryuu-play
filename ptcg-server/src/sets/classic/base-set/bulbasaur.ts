import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, Resistance, Weakness } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AfterDamageEffect, HealTargetEffect } from '../../../game/store/effects/attack-effects';

export class Bulbasaur extends PokemonCard {

  public id: number = 44;

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.GRASS];

  public hp: number = 40;

  public weakness: Weakness[] = [{ type: CardType.FIRE }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: 'Leech Seed',
      cost: [CardType.GRASS, CardType.GRASS],
      damage: 20,
      text: 'Unless all damage from this attack is prevented, you may remove 1 damage counter from Bulbasaur.'
    }
  ];

  public set: string = 'BS';

  public name: string = 'Bulbasaur';

  public fullName: string = 'Bulbasaur BS';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Leech Seed
    if (effect instanceof AfterDamageEffect && effect.attack === this.attacks[0]) {
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
