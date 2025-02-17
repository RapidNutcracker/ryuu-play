import { Effect } from '../../../game/store/effects/effect';
import { GameError } from '../../../game/game-error';
import { GameMessage } from '../../../game/game-message';
import { State } from '../../../game/store/state/state';
import { StoreLike } from '../../../game/store/store-like';
import { TrainerType } from '../../../game/store/card/card-types';
import { TrainerCard } from '../../../game/store/card/trainer-card';
import { TrainerEffect } from '../../../game/store/effects/play-card-effects';
import { CardList } from '../../../game/store/state/card-list';
import { OrderCardsPrompt } from '../../../game/store/prompts/order-cards-prompt';

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;

  if (player.deck.cards.length === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  const deckTop5: CardList = new CardList();
  player.deck.moveTo(deckTop5, 5);

  return store.prompt(state, new OrderCardsPrompt(
    player.id,
    GameMessage.CHOOSE_CARDS_ORDER,
    deckTop5,
    { allowCancel: true },
  ), order => {
    if (order === null) {
      return state;
    }

    deckTop5.applyOrder(order);
    deckTop5.moveTo(player.deck, undefined, true);
  });
}

export class Pokedex extends TrainerCard {

  public id: number = 87;

  public trainerType: TrainerType = TrainerType.ITEM;

  public set: string = 'BS';

  public name: string = 'Pokédex';

  public fullName: string = 'Pokédex BS';

  public text: string =
    'Look at up to 5 cards from the top of your deck and rearrange them as you like.';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, effect);
      return generator.next().value;
    }
    return state;
  }

}
