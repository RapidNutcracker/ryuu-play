import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, SpecialCondition } from '../../../game/store/card/card-types';
import { StoreLike, State, CoinFlipPrompt, Resistance, Weakness } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { GameMessage } from '../../../game/game-message';
import { AddSpecialConditionsEffect } from '../../../game/store/effects/attack-effects';

export class Beedrill extends PokemonCard {

  public id: number = 17;

  public stage: Stage = Stage.STAGE_2;

  public evolvesFrom: string = 'Kakuna';

  public cardType: CardType = CardType.GRASS;

  public hp: number = 80;

  public weakness: Weakness[] = [{ type: CardType.FIRE }];

  public resistance: Resistance[] = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [];

  public attacks = [
    {
      name: 'Twineedle',
      cost: [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS],
      damage: 30,
      text: 'Flip 2 coins. This attack does 30 damage times the number of heads.'
    },
    {
      name: 'Poison Sting',
      cost: [CardType.GRASS, CardType.GRASS, CardType.GRASS],
      damage: 40,
      text: 'Flip a coin. If heads, the Defending Pokémon is now Poisoned.'
    }
  ];

  public set: string = 'BS';

  public name: string = 'Beedrill';

  public fullName: string = 'Beedrill BS';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Twineedle
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP),
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], results => {
        let heads: number = 0;
        results.forEach(r => { heads += r ? 1 : 0; });
        effect.damage = 30 * heads;
      });
    }

    // Poison Sting
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;

      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], result => {
        if (result === true) {
          const specialConditionEffect = new AddSpecialConditionsEffect(effect, [SpecialCondition.POISONED]);
          store.reduceEffect(state, specialConditionEffect);
        }
      });
    }

    return state;
  }

}
