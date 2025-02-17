import { TrainerCard } from '../../../game/store/card/trainer-card';
import { EnergyType, SuperType, TrainerType } from '../../../game/store/card/card-types';
import { StoreLike } from '../../../game/store/store-like';
import { State } from '../../../game/store/state/state';
import { Effect } from '../../../game/store/effects/effect';
import { TrainerEffect } from '../../../game/store/effects/play-card-effects';
import { Card, ChooseCardsPrompt, GameError, GameMessage, ShowCardsPrompt, ShufflePrompt, StateUtils } from '../../../game';


function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);

  if (player.hand.cards.length === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  if (player.deck.cards.length === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  let cardsToDiscard: Card[] = [];
  yield store.prompt(state, new ChooseCardsPrompt(
    player.id,
    GameMessage.CHOOSE_CARD_TO_HAND,
    player.hand,
    {},
    { min: 1, max: 1, allowCancel: true }
  ), selected => {
    cardsToDiscard = selected || [];
    next();
  });

  if (cardsToDiscard.length === 0) {
    return state;
  }

  player.hand.moveCardsTo(cardsToDiscard, player.discard);

  let cards: Card[] = [];
  yield store.prompt(state, new ChooseCardsPrompt(
    player.id,
    GameMessage.CHOOSE_CARD_TO_HAND,
    player.deck,
    { superType: SuperType.ENERGY, energyType: EnergyType.BASIC },
    { min: 1, max: 2, allowCancel: false }
  ), selected => {
    cards = selected || [];
    next();
  });

  player.deck.moveCardsTo(cards, player.hand);

  if (cards.length > 0) {
    yield store.prompt(state, new ShowCardsPrompt(
      opponent.id,
      GameMessage.CARDS_SHOWED_BY_THE_OPPONENT,
      cards
    ), () => next());
  }

  return store.prompt(state, new ShufflePrompt(player.id), order => {
    player.deck.applyOrder(order);
  });
}


export class EarthenVessel extends TrainerCard {

  public id: number = 163;

  public trainerType: TrainerType = TrainerType.ITEM;

  public tags = [];

  public set: string = 'PAR';

  public name: string = 'Earthen Vessel';

  public fullName: string = 'Earthen Vessel PAR';

  public text: string =
    'You can use this card only if you discard another card from your hand.' +
    '\n' +
    'Search your deck for up to 2 Basic Energy cards, reveal them, ' +
    'and put them into your hand. Then, shuffle your deck.';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}
