import { TrainerCard } from '../../game/store/card/trainer-card';
import { SuperType, TrainerType } from '../../game/store/card/card-types';
import { StoreLike } from '../../game/store/store-like';
import { State } from '../../game/store/state/state';
import { Effect } from '../../game/store/effects/effect';
import { TrainerEffect } from '../../game/store/effects/play-card-effects';
import { ShufflePrompt } from '../../game/store/prompts/shuffle-prompt';
import { Card, ChooseCardsPrompt, GameMessage, ShowCardsPrompt, StateUtils } from '../../game';


function* playCard(next: Function, store: StoreLike, state: State, self: Arven, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);

  let cards: Card[] = [];
  yield store.prompt(state, new ChooseCardsPrompt(
    player.id,
    GameMessage.CHOOSE_ITEM_TO_HAND,
    player.deck,
    { superType: SuperType.TRAINER, trainerType: TrainerType.ITEM },
    { min: 0, max: 1, allowCancel: true }
  ), selected => {
    cards = cards.concat(selected);
    next();
  });

  yield store.prompt(state, new ChooseCardsPrompt(
    player.id,
    GameMessage.CHOOSE_TOOL_TO_HAND,
    player.deck,
    { superType: SuperType.TRAINER, trainerType: TrainerType.TOOL },
    { min: 0, max: 1, allowCancel: true }
  ), selected => {
    cards = cards.concat(selected);
    next();
  });

  if (cards.length > 0) {
    yield store.prompt(state, new ShowCardsPrompt(
      opponent.id,
      GameMessage.CARDS_SHOWED_BY_THE_OPPONENT,
      cards
    ), () => next());
  }

  player.supporter.moveCardTo(self, player.discard);
  player.deck.moveCardsTo(cards, player.hand);

  return store.prompt(state, new ShufflePrompt(player.id), order => {
    player.deck.applyOrder(order);
  });
}

export class Arven extends TrainerCard {

  public id: number = 186;

  public trainerType: TrainerType = TrainerType.SUPPORTER;

  public tags = [];

  public set: string = 'OBF';

  public name: string = 'Arven';

  public fullName: string = 'Arven OBF';

  public text: string =
    'Search your deck for an Item card and a Pokémon Tool card, ' +
    'reveal them, and put them into your hand. Then, shuffle your deck.';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, this, effect);
      return generator.next().value;
    }

    return state;
  }

}
