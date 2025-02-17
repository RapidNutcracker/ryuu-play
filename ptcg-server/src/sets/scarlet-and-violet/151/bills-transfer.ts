import { Card } from '../../../game/store/card/card';
import { TrainerCard } from '../../../game/store/card/trainer-card';
import { TrainerType, SuperType } from '../../../game/store/card/card-types';
import { StoreLike } from '../../../game/store/store-like';
import { State } from '../../../game/store/state/state';
import { Effect } from '../../../game/store/effects/effect';
import { TrainerEffect } from '../../../game/store/effects/play-card-effects';
import { CardList } from '../../../game/store/state/card-list';
import { ChooseCardsPrompt } from '../../../game/store/prompts/choose-cards-prompt';
import { GameMessage } from '../../../game/game-message';
import { ShowCardsPrompt } from '../../../game/store/prompts/show-cards-prompt';
import { StateUtils } from '../../../game/store/state-utils';
import { ShufflePrompt } from '../../../game/store/prompts/shuffle-prompt';

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);

  const deckTop = new CardList();
  player.deck.moveTo(deckTop, 8);

  let cards: Card[] = [];
  yield store.prompt(state, new ChooseCardsPrompt(
    player.id,
    GameMessage.CHOOSE_CARD_TO_HAND,
    deckTop,
    { superType: SuperType.POKEMON },
    { min: 1, max: 1, allowCancel: true }
  ), selected => {
    cards = selected || [];
    next();
  });

  if (cards.length > 0) {
    yield store.prompt(state, new ShowCardsPrompt(
      opponent.id,
      GameMessage.CARDS_SHOWED_BY_THE_OPPONENT,
      cards
    ), () => next());

    deckTop.moveCardsTo(cards, player.hand);
  }

  deckTop.moveTo(player.deck);

  return store.prompt(state, new ShufflePrompt(player.id), order => {
    player.deck.applyOrder(order);
  });
}

export class BillsTransfer extends TrainerCard {

  public id: number = 156;

  public trainerType: TrainerType = TrainerType.SUPPORTER;

  public set: string = 'MEW';

  public name: string = 'Bill\'s Transfer';

  public fullName: string = 'Bill\'s Transfer MEW';

  public text: string =
    'Look at the top 8 cards of your deck. ' +
    'You may reveal any number of Pokémon you find there and put them into your hand. ' +
    'Shuffle the other cards back into your deck.';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }

}
