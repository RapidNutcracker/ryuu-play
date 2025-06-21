import { Card } from '../../../game/store/card/card';
import { Effect } from '../../../game/store/effects/effect';
import { TrainerCard } from '../../../game/store/card/trainer-card';
import { TrainerType } from '../../../game/store/card/card-types';
import { StoreLike } from '../../../game/store/store-like';
import { State } from '../../../game/store/state/state';
import { TrainerEffect } from '../../../game/store/effects/play-card-effects';
import { ChooseCardsPrompt } from '../../../game/store/prompts/choose-cards-prompt';
import { GameError } from '../../../game/game-error';
import { GameMessage } from '../../../game/game-message';
import { CoinFlipPrompt } from '../../../game/store/prompts/coin-flip-prompt';

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;
  let cards: Card[] = [];

  if (player.discard.cards.length === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  effect.preventDefault = true;
  player.hand.moveCardTo(effect.trainerCard, player.supporter);

  let coinResult: boolean = false;
  yield store.prompt(state, new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP), result => {
    coinResult = result;
    next();
  });

  if (coinResult === false) {
    player.supporter.moveCardTo(effect.trainerCard, player.discard);
    return state;
  }

  yield store.prompt(state, new ChooseCardsPrompt(
    player.id,
    GameMessage.CHOOSE_CARD_TO_DECK,
    player.discard,
    {},
    { min: 1, max: 1, allowCancel: false }
  ), selected => {
    cards = selected || [];
    next();
  });

  player.discard.moveCardsTo(cards, player.deck, true);

  return state;
}

export class Recycle extends TrainerCard {

  public trainerType: TrainerType = TrainerType.ITEM;

  public set: string = 'FO';

  public name: string = 'Recycle';

  public fullName: string = 'Recycle FO';

  public text: string =
    'Flip a coin. If heads, put a card in your discard pile on top of your deck.';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }

}
