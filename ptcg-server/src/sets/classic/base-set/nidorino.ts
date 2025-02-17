import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, CoinFlipPrompt, Resistance, Weakness } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { GameMessage } from '../../../game/game-message';

export class Nidorino extends PokemonCard {

  public id: number = 37;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Nidoran Male';

  public cardType: CardType = CardType.GRASS;

  public hp: number = 60;

  public weakness: Weakness[] = [{ type: CardType.PSYCHIC }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS];

  public attacks = [{
    name: 'Double Kick',
    cost: [CardType.GRASS, CardType.COLORLESS, CardType.COLORLESS],
    damage: 30,
    text: 'Flip 2 coins. This attack does 30 damage times the number of heads.'
  }, {
    name: 'Horn Drill',
    cost: [CardType.GRASS, CardType.GRASS, CardType.COLORLESS, CardType.COLORLESS],
    damage: 50,
    text: ''
  }];

  public set: string = 'BS';

  public name: string = 'Nidorino';

  public fullName: string = 'Nidorino BS';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Double Kick
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

    return state;
  }

}
