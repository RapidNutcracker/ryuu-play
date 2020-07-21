import { TrainerCard } from "../../game/store/card/trainer-card";
import { TrainerType, SuperType, Stage } from "../../game/store/card/card-types";
import { StoreLike } from "../../game/store/store-like";
import { State } from "../../game/store/state/state";
import { Effect } from "../../game/store/effects/effect";
import { CoinFlipPrompt, ChooseCardsPrompt, Card, StateUtils, ShowCardsPrompt,
  ShuffleDeckPrompt } from "../../game";
import { CardMessage } from "../card-message";
import { PlayTrainerEffect } from "../../game/store/effects/play-card-effects";

function* playCard(next: Function, store: StoreLike, state: State, effect: PlayTrainerEffect): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);

  let heads: number = 0;
  yield store.prompt(state, [
    new CoinFlipPrompt(player.id, CardMessage.COIN_FLIP),
    new CoinFlipPrompt(player.id, CardMessage.COIN_FLIP)
  ], results => {
    results.forEach(r => { heads += r ? 1 : 0; });
    next();
  });

  if (heads === 0) {
    return state;
  }

  let cards: Card[] = [];
  yield store.prompt(state, new ChooseCardsPrompt(
    player.id,
    CardMessage.CHOOSE_BASIC_POKEMON,
    player.deck,
    { superType: SuperType.POKEMON, stage: Stage.BASIC },
    { allowCancel: true, min: 0, max: heads }
  ), results => {
    cards = results || [];
    next();
  });

  player.deck.moveCardsTo(cards, player.hand);

  if (cards.length > 0) {
    yield store.prompt(state, new ShowCardsPrompt(
      opponent.id,
      CardMessage.CARDS_SHOWED_BY_THE_OPPONENT,
      cards
    ), () => next());
  }

  return store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
    player.deck.applyOrder(order);
    next()
  });

  return state;
}

export class DualBall extends TrainerCard {

  public trainerType: TrainerType = TrainerType.ITEM;

  public set: string = 'HGSS';

  public name: string = 'Dual Ball';

  public fullName: string = 'Dual Ball UNL';

  public text: string =
    'Flip 2 coins. For each heads, search your deck for a Basic Pokemon ' +
    'card, show it to your opponent, and put it into your hand. Shuffle your ' +
    'deck afterward.';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PlayTrainerEffect && effect.trainerCard === this) {
      let generator: IterableIterator<State>;
      generator = playCard(() => generator.next(), store, state, effect);
      return generator.next().value;
    }
    return state;
  }

}
