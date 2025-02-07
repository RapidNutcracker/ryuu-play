import { TrainerCard } from '../../game/store/card/trainer-card';
import { TrainerType } from '../../game/store/card/card-types';
import { StoreLike } from '../../game/store/store-like';
import { State } from '../../game/store/state/state';
import { Effect } from '../../game/store/effects/effect';
import { TrainerEffect } from '../../game/store/effects/play-card-effects';
import { ShufflePrompt } from '../../game/store/prompts/shuffle-prompt';
import { StateUtils } from '../../game';


function* playCard(next: Function, store: StoreLike, state: State,
  self: Iono, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);

  player.hand.moveCardTo(self, player.discard);

  const wereCardsShuffledAway = player.hand.cards.length > 0 || opponent.hand.cards.length > 0;

  yield store.prompt(state, new ShufflePrompt(player.id, player.hand), order => {
    player.hand.applyOrder(order);
    next();
  });

  player.hand.moveTo(player.deck);

  yield store.prompt(state, new ShufflePrompt(opponent.id, opponent.hand), order => {
    opponent.hand.applyOrder(order);
    next();
  });

  opponent.hand.moveTo(opponent.deck);

  if (wereCardsShuffledAway) {
    player.deck.moveTo(player.hand, player.getPrizeLeft());
    opponent.deck.moveTo(opponent.hand, opponent.getPrizeLeft());
  }

  return state;
}

export class Iono extends TrainerCard {

  public id: number = 185;

  public trainerType: TrainerType = TrainerType.SUPPORTER;

  public tags = [];

  public set: string = 'PAL';

  public name: string = 'Iono';

  public fullName: string = 'Iono PAL';

  public text: string =
    'Each player shuffles their hand and puts it on the bottom of their deck. ' +
    'If either player put any cards on the bottom of their deck in this way, ' +
    'each player draws a card for each of their remaining Prize cards.';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, this, effect);
      return generator.next().value;
    }

    return state;
  }

}
