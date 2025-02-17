import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, SpecialCondition, CardTag } from '../../../game/store/card/card-types';
import { StoreLike, State } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect, KnockOutEffect } from '../../../game/store/effects/game-effects';
import { AbstractAttackEffect, AddSpecialConditionsEffect } from '../../../game/store/effects/attack-effects';

export class JynxEx extends PokemonCard {

  public id: number = 124;

  public tags: string[] = [CardTag.EX];

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.WATER];

  public hp: number = 200;

  public weakness = [{ type: CardType.METAL }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [{
    name: 'Heart-Stopping Kiss',
    cost: [CardType.WATER, CardType.COLORLESS, CardType.COLORLESS],
    damage: 0,
    text: 'If your opponent\'s Active Pokémon is Asleep, it is Knocked Out.'
  }, {
    name: 'Icy Wind',
    cost: [CardType.WATER, CardType.WATER, CardType.WATER],
    damage: 120,
    text: 'Your opponent\'s Active Pokémon is now Asleep.'
  }];

  public set: string = 'MEW';

  public name: string = 'Jynx ex';

  public fullName: string = 'Jynx ex MEW';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Heart-Stopping Kiss
    if (effect instanceof AbstractAttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      if (effect.target.specialConditions.includes(SpecialCondition.ASLEEP)) {
        const knockedOutEffect = new KnockOutEffect(player, effect.target);
        state = store.reduceEffect(state, knockedOutEffect);
      }

      return state;
    }

    // Icy Wind
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const specialCondition = new AddSpecialConditionsEffect(effect, [SpecialCondition.ASLEEP]);
      return store.reduceEffect(state, specialCondition);
    }

    return state;
  }
}
