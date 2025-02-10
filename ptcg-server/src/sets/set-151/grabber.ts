import { Card } from '../../game/store/card/card';
import { TrainerCard } from '../../game/store/card/trainer-card';
import { TrainerType, SuperType } from '../../game/store/card/card-types';
import { StoreLike } from '../../game/store/store-like';
import { State } from '../../game/store/state/state';
import { Effect } from '../../game/store/effects/effect';
import { TrainerEffect } from '../../game/store/effects/play-card-effects';
import { ChooseCardsPrompt } from '../../game/store/prompts/choose-cards-prompt';
import { GameMessage } from '../../game/game-message';
import { ShowCardsPrompt } from '../../game/store/prompts/show-cards-prompt';
import { StateUtils } from '../../game/store/state-utils';
import { PokemonCard } from '../../game/store/card/pokemon-card';

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);

  effect.preventDefault = true;
  player.hand.moveCardTo(effect.trainerCard, player.supporter);

  const opponentHasPokemonInHand = opponent.hand.cards.filter(card =>
    card instanceof PokemonCard
  );

  if (!opponentHasPokemonInHand) {
    yield store.prompt(state, new ShowCardsPrompt(
      player.id,
      GameMessage.CARDS_SHOWED_BY_THE_OPPONENT,
      opponent.hand.cards
    ), () => { next(); });

    return state;
  }

  let cards: Card[] = [];
  yield store.prompt(state, new ChooseCardsPrompt(
    player.id,
    GameMessage.CHOOSE_CARD_TO_DECK,
    opponent.hand,
    { superType: SuperType.POKEMON },
    { min: 1, max: 1, allowCancel: false }
  ), selected => {
    cards = selected || [];
    next();
  });

  opponent.hand.moveCardsTo(cards, opponent.deck);
  player.supporter.moveCardTo(effect.trainerCard, player.discard);

  return state;
}

export class Grabber extends TrainerCard {

  public id: number = 162;

  public trainerType: TrainerType = TrainerType.ITEM;

  public set: string = 'MEW';

  public name: string = 'Grabber';

  public fullName: string = 'Grabber MEW';

  public text: string =
    'Your opponent reveals their hand, and you put a Pokémon you find there on the bottom of their deck.';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }

}
