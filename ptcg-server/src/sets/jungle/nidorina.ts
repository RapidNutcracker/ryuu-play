import { AttackEffect } from '../../game/store/effects/game-effects';
import { Effect } from '../../game/store/effects/effect';
import { GameMessage } from '../../game/game-message';
import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType, SpecialCondition } from '../../game/store/card/card-types';
import {
  StoreLike,
  State,
  Resistance,
  Weakness,
  CoinFlipPrompt
} from '../../game';
import { AddSpecialConditionsEffect, AfterDamageEffect } from '../../game/store/effects/attack-effects';

export class Nidorina extends PokemonCard {

  public id: number = 40;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Nidoran Female';

  public cardType: CardType = CardType.GRASS;

  public hp: number = 70;

  public weakness: Weakness[] = [{ type: CardType.PSYCHIC }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS];

  public attacks = [{
    name: 'Supersonic',
    cost: [CardType.COLORLESS, CardType.COLORLESS],
    damage: 0,
    text: 'Flip a coin. If heads, the Defending Pokémon is now Confused.'
  }, {
    name: 'Double Kick',
    cost: [CardType.GRASS, CardType.COLORLESS, CardType.COLORLESS],
    damage: 30,
    text: 'Flip 2 coins. This attack does 30 damage times the number of heads.'
  }];

  public set: string = 'JU';

  public name: string = 'Nidorina';

  public fullName: string = 'Nidorina JU';

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

    // Double Kick
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
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

    return state;
  }

}
