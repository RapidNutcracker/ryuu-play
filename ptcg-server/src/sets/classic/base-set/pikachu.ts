import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, CoinFlipPrompt } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { GameMessage } from '../../../game/game-message';
import { DealDamageEffect } from '../../../game/store/effects/attack-effects';

export class Pikachu extends PokemonCard {

  public id: number = 58;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.LIGHTNING;

  public hp: number = 40;

  public weakness = [{ type: CardType.FIGHTING }];

  public retreat = [CardType.COLORLESS];

  public attacks = [{
    name: 'Gnaw',
    cost: [CardType.COLORLESS],
    damage: 10,
    text: ''
  }, {
    name: 'Thunder Jolt',
    cost: [CardType.LIGHTNING, CardType.COLORLESS],
    damage: 30,
    text: 'Flip a coin. If tails, Pikachu does 10 damage to itself.'
  }];

  public set: string = 'BS';

  public name: string = 'Pikachu';

  public fullName: string = 'Pikachu BS';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    // Thunder Jolt
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;

      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], result => {
        if (result === true) {
          effect.damage += 10;
        } else {
          const dealDamage = new DealDamageEffect(effect, 10);
          dealDamage.target = player.active;
          return store.reduceEffect(state, dealDamage);
        }
      });
    }

    return state;
  }
}
