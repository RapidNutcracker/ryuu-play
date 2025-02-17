import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, CoinFlipPrompt } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { GameMessage } from '../../../game/game-message';
import { DealDamageEffect } from '../../../game/store/effects/attack-effects';

export class Mankey extends PokemonCard {

  public id: number = 56;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.FIGHTING;

  public hp: number = 60;

  public weakness = [{ type: CardType.PSYCHIC }];

  public retreat = [CardType.COLORLESS];

  public attacks = [{
    name: 'Thrash',
    cost: [CardType.FIGHTING],
    damage: 20,
    text: 'Flip a coin. If tails, this Pokémon also does 20 damage to itself. If heads, this attack does 20 more damage.'
  }];

  public set: string = 'MEW';

  public name: string = 'Mankey';

  public fullName: string = 'Mankey MEW';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Thrash
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], result => {
        if (result === true) {
          effect.damage += 20;
        } else {
          const dealDamage = new DealDamageEffect(effect, 20);
          dealDamage.target = player.active;
          return store.reduceEffect(state, dealDamage);
        }
      });
    }

    return state;
  }
}
