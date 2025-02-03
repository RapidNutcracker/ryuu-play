import { Card } from '../../game/store/card/card';
import { CardList } from '../../game/store/state/card-list';
import { ChooseCardsPrompt } from '../../game/store/prompts/choose-cards-prompt';
import { Effect } from '../../game/store/effects/effect';
import { EnergyCard } from '../../game/store/card/energy-card';
import { EnergyType, SuperType, TrainerType } from '../../game/store/card/card-types';
import { GameError } from '../../game/game-error';
import { GameMessage } from '../../game/game-message';
import { State } from '../../game/store/state/state';
import { StoreLike } from '../../game/store/store-like';
import { TrainerCard } from '../../game/store/card/trainer-card';
import { TrainerEffect } from '../../game/store/effects/play-card-effects';


function* playCard(next: Function, store: StoreLike, state: State,
  self: EnergyRetrieval, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;
  let cards: Card[] = [];

  cards = player.hand.cards.filter(c => c !== self);
  if (cards.length < 1) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  // Player has no Basic Energy in the discard pile
  let basicEnergyCards = 0;
  player.discard.cards.forEach(c => {
    if (c instanceof EnergyCard && c.energyType === EnergyType.BASIC) {
      basicEnergyCards++;
    }
  });
  if (basicEnergyCards === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  // We will discard this card after prompt confirmation
  effect.preventDefault = true;

  // prepare card list without Energy Retrieval
  const handTemp = new CardList();
  handTemp.cards = player.hand.cards.filter(c => c !== self);

  yield store.prompt(state, new ChooseCardsPrompt(
    player.id,
    GameMessage.CHOOSE_CARD_TO_DISCARD,
    handTemp,
    {},
    { min: 1, max: 1, allowCancel: true }
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
    { superType: SuperType.ENERGY },
    { min: 1, max: 2, allowCancel: false }
  ), selected => {
    cards = selected || [];
    next();
  });

  player.discard.moveCardsTo(cards, player.hand);

  return state;
}

export class EnergyRetrieval extends TrainerCard {

  public trainerType: TrainerType = TrainerType.ITEM;

  public tags = [];

  public set: string = 'BS';

  public name: string = 'Energy Retrieval';

  public fullName: string = 'Energy Retrieval BS';

  public text: string =
    'Trade 1 of the other cards in your hand for up to 2 basic Energy cards from your discard pile.';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, this, effect);
      return generator.next().value;
    }
    return state;
  }

}
