import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType, SpecialCondition } from '../../game/store/card/card-types';
import { StoreLike, State, CoinFlipPrompt } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect } from '../../game/store/effects/game-effects';
import { GameMessage } from '../../game/game-message';
import { AddSpecialConditionsEffect } from '../../game/store/effects/attack-effects';

export class Poliwrath extends PokemonCard {

  public id: number = 62;

  public stage: Stage = Stage.STAGE_2;

  public evolvesFrom: string = 'Poliwhirl';

  public cardType: CardType = CardType.WATER;

  public hp: number = 160;

  public weakness = [{ type: CardType.GRASS }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [{
    name: 'Bubble Beam',
    cost: [CardType.WATER],
    damage: 50,
    text: 'Flip a coin. If heads, your opponent\'s Active Pokémon is now Paralyzed.'
  }, {
    name: 'Heroic Punch',
    cost: [CardType.WATER, CardType.COLORLESS, CardType.COLORLESS],
    damage: 100,
    text: 'Flip a coin. If heads, this attack does 150 more damage.'
  }];

  public set: string = 'BS';

  public name: string = 'Poliwrath';

  public fullName: string = 'Poliwrath BS';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Bubble Beam
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

    // Heroic Punch
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;

      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], result => {
        if (result === true) {
          effect.damage += 150;
        }
      });
    }

    return state;
  }

}
