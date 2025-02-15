import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';
import { StoreLike, State, GameMessage, CoinFlipPrompt } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect } from '../../game/store/effects/game-effects';

export class Meowth extends PokemonCard {

  public id: number = 56;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.COLORLESS;

  public hp: number = 50;

  public weakness = [{ type: CardType.FIGHTING }];

  public resistance = [{ type: CardType.PSYCHIC, value: -30 }];

  public retreat = [CardType.COLORLESS];

  public attacks = [{
    name: 'Pay Day',
    cost: [CardType.COLORLESS, CardType.COLORLESS],
    damage: 0,
    text: 'Flip a coin. If heads, draw a card.'
  }];

  public set: string = 'JU';

  public name: string = 'Meowth';

  public fullName: string = 'Meowth JU';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    // Pay Day
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      return store.prompt(state,
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP),
        result => {
          if (result === true) {
            player.deck.moveTo(player.hand, 1);
          }
        });
    }

    return state;
  }
}
