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

  effect.preventDefault = true;
  player.hand.moveCardTo(effect.trainerCard, player.supporter);

  const deckTop = new CardList();
  player.deck.moveTo(deckTop, 7);

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


  if (cards.length === 0) {
    player.supporter.moveCardTo(effect.trainerCard, player.hand);
  } else {
    yield store.prompt(state, new ShowCardsPrompt(
      opponent.id,
      GameMessage.CARDS_SHOWED_BY_THE_OPPONENT,
      cards
    ), () => next());

    deckTop.moveCardsTo(cards, player.hand);
    player.supporter.moveCardTo(effect.trainerCard, player.discard);
  }

  deckTop.moveTo(player.deck);

  return store.prompt(state, new ShufflePrompt(player.id), order => {
    player.deck.applyOrder(order);
  });
}

export class GreatBall extends TrainerCard {

  public trainerType: TrainerType = TrainerType.ITEM;

  public set: string = 'BCR';

  public name: string = 'Great Ball';

  public fullName: string = 'Great Ball BCR';

  public text: string =
    'Look at the top 7 cards of your deck. ' +
    'You may reveal a Pokémon you find there and put it into your hand. ' +
    'Shuffle the other cards back into your deck.';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }

}
