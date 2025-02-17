import { AttackEffect, HealEffect } from '../../../game/store/effects/game-effects';
import { Effect } from '../../../game/store/effects/effect';
import { GameMessage } from '../../../game/game-message';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Resistance, Weakness } from '../../../game/store/card/pokemon-types';
import { Stage, CardType, SpecialCondition } from '../../../game/store/card/card-types';
import { State } from '../../../game/store/state/state';
import { StoreLike } from '../../../game/store/store-like';
import { CoinFlipPrompt } from '../../../game';
import { AddSpecialConditionsEffect, AfterDamageEffect } from '../../../game/store/effects/attack-effects';

export class Venonat extends PokemonCard {

  public id: number = 63;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.GRASS;

  public hp: number = 40;

  public weakness: Weakness[] = [{ type: CardType.FIRE }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS];

  public attacks = [{
    name: 'Stun Spore',
    cost: [CardType.GRASS],
    damage: 10,
    text: 'Flip a coin. If heads, the Defending Pokémon is now Paralyzed.'
  }, {
    name: 'Leech Life',
    cost: [CardType.GRASS, CardType.COLORLESS],
    damage: 10,
    text:
      'Remove a number of damage counters from Venonat equal to the damage done ' +
      'to the Defending Pokémon (after applying Weakness and Resistance).'
  }];

  public set: string = 'JU';

  public name: string = 'Venonat';

  public fullName: string = 'Venonat JU';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Stun Spore
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], result => {
        if (result === true) {
          const specialConditionEffect = new AddSpecialConditionsEffect(effect, [SpecialCondition.PARALYZED]);
          store.reduceEffect(state, specialConditionEffect);
        }
      });
    }

    // Sprout
    if (effect instanceof AfterDamageEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;

      const healEffect = new HealEffect(player, effect.source, effect.damage);
      return store.reduceEffect(state, healEffect);
    }

    return state;
  }
}
