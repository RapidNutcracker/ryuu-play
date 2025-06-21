import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, SpecialCondition } from '../../../game/store/card/card-types';
import { StoreLike, State, GameMessage, CoinFlipPrompt } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AddSpecialConditionsEffect, AfterDamageEffect } from '../../../game/store/effects/attack-effects';

export class Ekans extends PokemonCard {

  public id: number = 46;

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.GRASS];

  public hp: number = 40;

  public weakness = [{ type: CardType.PSYCHIC }];

  public retreat = [CardType.COLORLESS];

  public attacks = [{
    name: 'Spit Poison',
    cost: [CardType.GRASS],
    damage: 0,
    text:
      'Flip a coin. If heads, the Defending Pokémon is now Poisoned.'
  }, {
    name: 'Wrap',
    cost: [CardType.GRASS, CardType.COLORLESS],
    damage: 20,
    text:
      'Flip a coin. If heads, the Defending Pokémon is now Paralyzed.'
  }];

  public set: string = 'FO';

  public name: string = 'Ekans';

  public fullName: string = 'Ekans FO';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Spit Poison
    if (effect instanceof AfterDamageEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], result => {
        if (result === true) {
          const specialConditionEffect = new AddSpecialConditionsEffect(effect.attackEffect, [SpecialCondition.POISONED]);
          store.reduceEffect(state, specialConditionEffect);
        }
      });
    }

    // Wrap
    if (effect instanceof AfterDamageEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;

      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], result => {
        if (result === true) {
          const specialConditionEffect = new AddSpecialConditionsEffect(effect.attackEffect, [SpecialCondition.PARALYZED]);
          store.reduceEffect(state, specialConditionEffect);
        }
      });
    }

    return state;
  }
}
