import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, SpecialCondition } from '../../../game/store/card/card-types';
import { StoreLike, State, Resistance, CoinFlipPrompt, GameMessage } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { HealEffect } from '../../../game/store/effects/game-effects';
import { AddSpecialConditionsEffect, AfterDamageEffect } from '../../../game/store/effects/attack-effects';

export class Zubat extends PokemonCard {

  public id: number = 57;

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.GRASS];

  public hp: number = 40;

  public weakness = [{ type: CardType.PSYCHIC }];

  public resistance: Resistance[] = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [];

  public attacks = [{
    name: 'Supersonic',
    cost: [CardType.COLORLESS, CardType.COLORLESS],
    damage: 0,
    text:
      'Flip a coin. If heads, the Defending Pokémon is now Confused.'
  }, {
    name: 'Leech Life',
    cost: [CardType.GRASS, CardType.COLORLESS],
    damage: 10,
    text:
      'Remove a number of damage counters from Zubat equal to the damage done ' +
      'to the Defending Pokémon (after applying Weakness and Resistance). ' +
      'If Zubat has fewer damage counters than that, remove all of them.'
  }];

  public set: string = 'FO';

  public name: string = 'Zubat';

  public fullName: string = 'Zubat FO';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Supersonic
    if (effect instanceof AfterDamageEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], result => {
        if (result === true) {
          const specialConditionEffect = new AddSpecialConditionsEffect(effect.attackEffect, [SpecialCondition.CONFUSED]);
          store.reduceEffect(state, specialConditionEffect);
        }
      });
    }

    // Leech Life
    if (effect instanceof AfterDamageEffect && effect.attack === this.attacks[1]) {
      const healEffect = new HealEffect(effect.player, effect.source, effect.damage);
      store.reduceEffect(state, healEffect);
    }

    return state;
  }
}
