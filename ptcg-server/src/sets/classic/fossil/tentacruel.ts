import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, SpecialCondition } from '../../../game/store/card/card-types';
import { StoreLike, State, GameMessage, CoinFlipPrompt } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AddSpecialConditionsEffect, AfterDamageEffect } from '../../../game/store/effects/attack-effects';

export class Tentacruel extends PokemonCard {

  public id: number = 44;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom = 'Tentacool';

  public cardTypes: CardType[] = [CardType.WATER];

  public hp: number = 60;

  public weakness = [{ type: CardType.LIGHTNING }];

  public retreat = [];

  public attacks = [{
    name: 'Supersonic',
    cost: [CardType.WATER],
    damage: 0,
    text:
      'Flip a coin. If heads, the Defending Pokémon is now Confused.'
  }, {
    name: 'Jellyfish Sting',
    cost: [CardType.WATER, CardType.WATER],
    damage: 10,
    text:
      'The Defending Pokémon is now Poisoned'
  }];

  public set: string = 'FO';

  public name: string = 'Tentacruel';

  public fullName: string = 'Tentacruel FO';

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

    // Jellyfish Sting
    if (effect instanceof AfterDamageEffect && effect.attack === this.attacks[1]) {
      const specialConditionEffect = new AddSpecialConditionsEffect(effect.attackEffect, [SpecialCondition.POISONED]);
      store.reduceEffect(state, specialConditionEffect);
    }

    return state;
  }
}
