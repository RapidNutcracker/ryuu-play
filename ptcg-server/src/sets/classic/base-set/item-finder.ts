import { TrainerCard } from '../../../game/store/card/trainer-card';
import { SuperType, TrainerType } from '../../../game/store/card/card-types';
import { StoreLike } from '../../../game/store/store-like';
import { State } from '../../../game/store/state/state';
import { Effect } from '../../../game/store/effects/effect';
import { TrainerEffect } from '../../../game/store/effects/play-card-effects';
import { GameError } from '../../../game/game-error';
import { GameMessage } from '../../../game/game-message';
import { Card } from '../../../game/store/card/card';
import { ChooseCardsPrompt } from '../../../game/store/prompts/choose-cards-prompt';
import { CardList } from '../../../game/store/state/card-list';


function* playCard(next: Function, store: StoreLike, state: State,
  self: ItemFinder, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;
  let cards: Card[] = [];

  cards = player.hand.cards.filter(c => c !== self);
  if (cards.length < 2) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  if (player.discard.cards.length === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  const hasDiscardedTrainerCards = player.discard.cards.some((c: Card) => c instanceof TrainerCard);

  if (!hasDiscardedTrainerCards) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  // We will discard this card after prompt confirmation
  effect.preventDefault = true;

  // prepare card list without Item Finder
  const handTemp = new CardList();
  handTemp.cards = player.hand.cards.filter(c => c !== self);

  yield store.prompt(state, new ChooseCardsPrompt(
    player.id,
    GameMessage.CHOOSE_CARD_TO_DISCARD,
    handTemp,
    {},
    { min: 2, max: 2, allowCancel: true }
  ), selected => {
    cards = selected || [];
    next();
  });

  // Operation canceled by the user
  if (cards.length === 0) {
    return state;
  }

  player.hand.moveCardTo(self, player.discard);
  player.hand.moveCardsTo(cards, player.discard);

  yield store.prompt(state, new ChooseCardsPrompt(
    player.id,
    GameMessage.CHOOSE_CARD_TO_HAND,
    player.discard,
    { superType: SuperType.TRAINER },
    { min: 1, max: 1, allowCancel: false }
  ), selected => {
    cards = selected || [];
    next();
  });

  player.discard.moveCardsTo(cards, player.hand);

  return state;
}

export class ItemFinder extends TrainerCard {

  public trainerType: TrainerType = TrainerType.ITEM;

  public tags = [];

  public set: string = 'BS';

  public name: string = 'Item Finder';

  public fullName: string = 'Item Finder BS';

  public text: string =
    'Discard 2 of the other cards from your hand ' +
    'in order to put a Trainer card from your discard pile into your hand.';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, this, effect);
      return generator.next().value;
    }
    return state;
  }

}
