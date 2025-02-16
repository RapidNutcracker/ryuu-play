import { Effect } from '../../game/store/effects/effect';
import { TrainerCard } from '../../game/store/card/trainer-card';
import { TrainerType } from '../../game/store/card/card-types';
import { StoreLike } from '../../game/store/store-like';
import { State } from '../../game/store/state/state';
import { StateUtils } from '../../game/store/state-utils';
import { TrainerEffect } from '../../game/store/effects/play-card-effects';
import { ShowCardsPrompt } from '../../game/store/prompts/show-cards-prompt';
import { ShufflePrompt } from '../../game/store/prompts/shuffle-prompt';
import { GameMessage } from '../../game/game-message';

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);

  // Do not discard the card yet
  effect.preventDefault = true;

  // Discard trainer only when user selected a Pokémon
  player.hand.moveCardTo(effect.trainerCard, player.discard);

  yield store.prompt(state, new ShowCardsPrompt(
    player.id,
    GameMessage.CARDS_SHOWED_BY_THE_OPPONENT,
    opponent.hand.cards
  ), () => next());

  yield store.prompt(state, new ShowCardsPrompt(
    opponent.id,
    GameMessage.CARDS_SHOWED_BY_THE_OPPONENT,
    player.hand.cards
  ), () => next());

  const opponent_trainer_cards = opponent.hand.cards.filter(c => c instanceof TrainerCard);
  opponent.hand.moveCardsTo(opponent_trainer_cards, opponent.deck);

  yield store.prompt(state, new ShufflePrompt(opponent.id), order => {
    opponent.deck.applyOrder(order);
    next();
  });

  const player_trainer_cards = player.hand.cards.filter(c => c instanceof TrainerCard);
  player.hand.moveCardsTo(player_trainer_cards, player.deck);

  yield store.prompt(state, new ShufflePrompt(player.id), order => {
    player.deck.applyOrder(order);
    next();
  });

  return state;
}

export class Lass extends TrainerCard {

  public trainerType: TrainerType = TrainerType.ITEM;

  public set: string = 'BS';

  public name: string = 'Lass';

  public fullName: string = 'Lass BS';

  public text: string =
    'You and your opponent show each other your hands, ' +
    'then shuffle all the Trainer cards from your hands into your decks.';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }

}
