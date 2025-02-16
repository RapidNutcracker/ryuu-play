import { Effect } from '../../game/store/effects/effect';
import { GameLog, GameMessage } from '../../game/game-message';
import { State } from '../../game/store/state/state';
import { StoreLike } from '../../game/store/store-like';
import { TrainerType } from '../../game/store/card/card-types';
import { TrainerCard } from '../../game/store/card/trainer-card';
import { TrainerEffect } from '../../game/store/effects/play-card-effects';
import { ShufflePrompt } from '../../game/store/prompts/shuffle-prompt';
import { CoinFlipPrompt } from '../../game';

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;

  effect.preventDefault = true;

  store.log(state, GameLog.LOG_PLAYER_PLAYS_ITEM, {
    name: effect.player.name,
    card: effect.trainerCard.name
  });

  player.hand.moveCardTo(effect.trainerCard, player.supporter);
  player.hand.moveTo(player.deck);

  yield store.prompt(state, new ShufflePrompt(player.id), order => {
    player.deck.applyOrder(order);
    next();
  });

  return store.prompt(state,
    new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP),
    result => {
      const numberOfCardsToDraw = result === true ? 8 : 1;
      player.deck.moveTo(player.hand, numberOfCardsToDraw);

      player.supporter.moveCardTo(effect.trainerCard, player.discard);
    }
  );
}

export class Gambler extends TrainerCard {

  public id: number = 61;

  public trainerType: TrainerType = TrainerType.ITEM;

  public set: string = 'FO';

  public name: string = 'Gambler';

  public fullName: string = 'Gambler FO';

  public text: string =
    'Shuffle your hand into your deck. Flip a coin. If heads, draw 8 cards. If tails, draw 1 card.';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, effect);
      return generator.next().value;
    }
    return state;
  }

}
