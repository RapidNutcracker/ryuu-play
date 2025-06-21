import { Effect } from '../../../game/store/effects/effect';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Weakness } from '../../../game/store/card/pokemon-types';
import { Stage, CardType, SpecialCondition } from '../../../game/store/card/card-types';
import { State } from '../../../game/store/state/state';
import { StoreLike } from '../../../game/store/store-like';
import { AddSpecialConditionsEffect, AfterDamageEffect, PutDamageEffect } from '../../../game/store/effects/attack-effects';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { CoinFlipPrompt, GameMessage, StateUtils } from '../../../game';

export class Weezing extends PokemonCard {

  public id: number = 46;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Koffing';

  public cardTypes: CardType[] = [CardType.GRASS];

  public hp: number = 60;

  public weakness: Weakness[] = [{ type: CardType.PSYCHIC }];

  public retreat = [CardType.COLORLESS];

  public attacks = [{
    name: 'Smog',
    cost: [CardType.GRASS, CardType.GRASS],
    damage: 20,
    text: 'Flip a coin. If heads, the Defending Pokémon is now Poisoned.'
  }, {
    name: 'Selfdestruct',
    cost: [CardType.FIGHTING, CardType.FIGHTING, CardType.FIGHTING, CardType.FIGHTING],
    damage: 60,
    text:
      'Does 10 damage to each Pokémon on each player\'s Bench. ' +
      '(Don\'t apply Weakness and Resistance for Benched Pokémon.) Weezing does 60 damage to itself.'
  }];

  public set: string = 'FO';

  public name: string = 'Weezing';

  public fullName: string = 'Weezing FO';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Smog
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

    // Selfdestruct
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      [...player.bench, ...opponent.bench].forEach(benchSlot => {
        if (benchSlot.cards.length > 0) {
          const putDamageEffect = new PutDamageEffect(effect, 10);
          putDamageEffect.target = benchSlot;
          store.reduceEffect(state, putDamageEffect);
        }
      });


      const selfDamageEffect = new PutDamageEffect(effect, 60);
      selfDamageEffect.target = player.active;
      store.reduceEffect(state, selfDamageEffect);
    }

    return state;
  }

}
