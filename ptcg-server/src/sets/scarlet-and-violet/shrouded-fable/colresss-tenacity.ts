import { TrainerCard } from '../../../game/store/card/trainer-card';
import { TrainerType } from '../../../game/store/card/card-types';
import { StoreLike } from '../../../game/store/store-like';
import { State } from '../../../game/store/state/state';
import { Effect } from '../../../game/store/effects/effect';
import { TrainerEffect } from '../../../game/store/effects/play-card-effects';
import { ShufflePrompt } from '../../../game/store/prompts/shuffle-prompt';
import { Card, ChooseCardsPrompt, EnergyCard, GameError, GameMessage, ShowCardsPrompt, StateUtils } from '../../../game';


function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);

  if (player.deck.cards.length === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  const blocked: number[] = [];
  player.deck.cards.forEach((card, index) => {
    if (!((card instanceof TrainerCard && card.trainerType === TrainerType.STADIUM) || card instanceof EnergyCard)) {
      blocked.push(index);
    }
  });

  let cards: Card[] = [];
  yield store.prompt(state, new ChooseCardsPrompt(
    player.id,
    GameMessage.CHOOSE_CARD_TO_HAND,
    player.deck,
    {},
    { min: 1, max: 2, allowCancel: false, blocked, maxEnergies: 1, maxTrainers: 1 }
  ), selected => {
    cards = selected || [];
    next();
  });

  if (cards.length === 0) {
    player.supporter.moveCardTo(effect.trainerCard, player.discard);
    return store.prompt(state, new ShufflePrompt(player.id), order => {
      player.deck.applyOrder(order);
    });
  }

  yield store.prompt(state, new ShowCardsPrompt(
    opponent.id,
    GameMessage.CARDS_SHOWED_BY_THE_OPPONENT,
    cards
  ), () => next());

  player.supporter.moveCardTo(effect.trainerCard, player.discard);
  player.deck.moveCardsTo(cards, player.hand);

  return store.prompt(state, new ShufflePrompt(player.id), order => {
    player.deck.applyOrder(order);
  });
}

export class ColresssTenacity extends TrainerCard {

  public id: number = 57;

  public trainerType: TrainerType = TrainerType.SUPPORTER;

  public tags = [];

  public set: string = 'SFA';

  public name: string = 'Colress\'s Tenacity';

  public fullName: string = 'Colress\'s Tenacity SFA';

  public text: string =
    'Search your deck for a Stadium card and an Energy card, ' +
    'reveal them, and put them into your hand. Then, shuffle your deck.';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }

}
