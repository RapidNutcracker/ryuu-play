import { TrainerCard } from '../../game/store/card/trainer-card';
import { TrainerType } from '../../game/store/card/card-types';
import { StoreLike } from '../../game/store/store-like';
import { State } from '../../game/store/state/state';
import { Effect } from '../../game/store/effects/effect';
import { TrainerEffect } from '../../game/store/effects/play-card-effects';
import { ShowCardsPrompt } from '../../game/store/prompts/show-cards-prompt';
import { GameError } from '../../game/game-error';
import { GameMessage } from '../../game/game-message';
import { Card } from '../../game/store/card/card';

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;

  player.deck.moveTo(player.hand, 2);

  const prizes = player.prizes.filter(p => p.isSecret);
  const cards: Card[] = [];
  prizes.forEach(p => { p.cards.forEach(c => cards.push(c)); });

  // All prizes are face-up
  if (cards.length === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  // Make prizes no more secret, before displaying prompt
  prizes.forEach(p => { p.isSecret = false; });

  yield store.prompt(state, new ShowCardsPrompt(
    player.id,
    GameMessage.CARDS_SHOWED_BY_EFFECT,
    cards,
  ), () => { next(); });

  // Prizes are secret once again.
  prizes.forEach(p => { p.isSecret = true; });

  return state;
}

export class DaisysHelp extends TrainerCard {

  public id: number = 158;

  public trainerType: TrainerType = TrainerType.SUPPORTER;

  public set: string = 'MEW';

  public name: string = 'Daisy\'s Help';

  public fullName: string = 'Daisy\'s Help MEW';

  public text: string =
    'Draw 2 cards. Look at your face-down Prize cards.';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }

}
