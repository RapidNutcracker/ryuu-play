import { TrainerCard } from '../../game/store/card/trainer-card';
import { TrainerType, SuperType } from '../../game/store/card/card-types';
import { StoreLike } from '../../game/store/store-like';
import { State } from '../../game/store/state/state';
import { Effect } from '../../game/store/effects/effect';
import {
  CoinFlipPrompt, ChooseCardsPrompt, Card, StateUtils, ShowCardsPrompt,
  ShufflePrompt, GameError
} from '../../game';
import { GameMessage } from '../../game/game-message';
import { TrainerEffect } from '../../game/store/effects/play-card-effects';

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);

  if (player.deck.cards.length === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  let didFlipHeads: boolean = false
  yield store.prompt(state,
    new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP),
    result => {
      didFlipHeads = result;
      next();
    });

  if (!didFlipHeads) {
    return state;
  }

  let cards: Card[] = [];
  yield store.prompt(state, new ChooseCardsPrompt(
    player.id,
    GameMessage.CHOOSE_CARD_TO_HAND,
    player.deck,
    { superType: SuperType.POKEMON },
    { min: 0, max: 1, allowCancel: true }
  ), results => {
    cards = results || [];
    next();
  });


  if (cards.length > 0) {
    yield store.prompt(state, new ShowCardsPrompt(
      opponent.id,
      GameMessage.CARDS_SHOWED_BY_THE_OPPONENT,
      cards
    ), () => next());
  }

  player.deck.moveCardsTo(cards, player.hand);

  return store.prompt(state, new ShufflePrompt(player.id), order => {
    player.deck.applyOrder(order);
  });
}

export class PokeBall extends TrainerCard {

  public trainerType: TrainerType = TrainerType.ITEM;

  public set: string = 'JU';

  public name: string = 'Poké Ball';

  public fullName: string = 'Poké Ball JU';

  public text: string =
    'Flip a coin. ' +
    'If heads, you may search your deck for any Basic Pokémon or Evolution card. ' +
    'Show that card to your opponent, then put it into your hand. Shuffle your deck afterward.';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }

}
