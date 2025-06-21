import { TrainerCard } from '../../../game/store/card/trainer-card';
import { TrainerType } from '../../../game/store/card/card-types';
import { StoreLike } from '../../../game/store/store-like';
import { State } from '../../../game/store/state/state';
import { Effect } from '../../../game/store/effects/effect';
import { TrainerEffect } from '../../../game/store/effects/play-card-effects';
import { Card, CardList, ChooseCardsPrompt, GameError, GameMessage, OrderCardsPrompt } from '../../../game';


function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;

  if (player.deck.cards.length === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  const deckTop = new CardList();
  player.deck.moveTo(deckTop, 5);

  let cards: Card[] = [];
  yield store.prompt(state, new ChooseCardsPrompt(
    player.id,
    GameMessage.CHOOSE_CARD_TO_DISCARD,
    deckTop,
    {},
    { min: 1, max: 5, allowCancel: true }
  ), selected => {
    cards = selected || [];
    next();
  });

  deckTop.moveCardsTo(cards, player.discard);

  return store.prompt(state, new OrderCardsPrompt(
    player.id,
    GameMessage.CHOOSE_CARDS_ORDER,
    deckTop,
    { allowCancel: true },
  ), order => {
    if (order === null) {
      return state;
    }

    deckTop.applyOrder(order);
    deckTop.moveTo(player.deck, deckTop.cards.length, true);
  });
}

export class Raifort extends TrainerCard {

  public id: number = 142;

  public trainerType: TrainerType = TrainerType.SUPPORTER;

  public tags = [];

  public set: string = 'PRE';

  public name: string = 'Raifort';

  public fullName: string = 'Raifort PRE';

  public text: string =
    'Look at the top 5 cards of your deck and discard any number of them. ' +
    'Put the other cards back in any order.';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }

}
