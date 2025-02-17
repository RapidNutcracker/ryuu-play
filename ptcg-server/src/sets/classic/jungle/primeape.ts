import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, SpecialCondition } from '../../../game/store/card/card-types';
import { StoreLike, State, CoinFlipPrompt, GameMessage } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { AddSpecialConditionsEffect, AfterDamageEffect } from '../../../game/store/effects/attack-effects';

export class Primeape extends PokemonCard {

  public id: number = 43;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Mankey';

  public cardTypes: CardType[] = [CardType.FIGHTING];

  public hp: number = 70;

  public weakness = [{ type: CardType.PSYCHIC }];

  public retreat = [CardType.COLORLESS];

  public attacks = [{
    name: 'Fury Swipes',
    cost: [CardType.FIGHTING, CardType.FIGHTING],
    damage: 20,
    text: 'Flip 3 coins. This attack does 20 damage times the number of heads.'
  }, {
    name: 'Tantrum',
    cost: [CardType.FIGHTING, CardType.FIGHTING, CardType.COLORLESS],
    damage: 150,
    text: 'Flip a coin. If tails, Primeape is now Confused (after doing damage).'
  }];

  public set: string = 'JU';

  public name: string = 'Primeape';

  public fullName: string = 'Primeape JU';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Fury Swipes
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP),
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP),
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], results => {
        let heads: number = 0;
        results.forEach(r => { heads += r ? 1 : 0; });
        effect.damage = 30 * heads;
      });
    }

    // Tantrum
    if (effect instanceof AfterDamageEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;

      return store.prompt(
        state,
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP),
        result => {
          if (result === false) {
            const addSpecialConditionsEffect = new AddSpecialConditionsEffect(effect.attackEffect, [SpecialCondition.CONFUSED]);
            addSpecialConditionsEffect.target = effect.source;
            state = store.reduceEffect(state, addSpecialConditionsEffect);
          }
        });
    }

    return state;
  }
}
