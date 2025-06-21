import { Card } from '../../../game/store/card/card';
import { Effect } from '../../../game/store/effects/effect';
import { GameError } from '../../../game/game-error';
import { GameMessage } from '../../../game/game-message';
import { TrainerCard } from '../../../game/store/card/trainer-card';
import { TrainerType, SuperType, CardTag } from '../../../game/store/card/card-types';
import { StoreLike } from '../../../game/store/store-like';
import { State } from '../../../game/store/state/state';
import { StateUtils } from '../../../game/store/state-utils';
import { TrainerEffect } from '../../../game/store/effects/play-card-effects';
import { ChooseCardsPrompt } from '../../../game/store/prompts/choose-cards-prompt';
import { ShowCardsPrompt } from '../../../game/store/prompts/show-cards-prompt';
import { ShufflePrompt } from '../../../game/store/prompts/shuffle-prompt';
import { PokemonCard } from '../../../game/store/card/pokemon-card';

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);
  let cards: Card[] = [];

  if (player.deck.cards.length === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  effect.preventDefault = true;
  player.hand.moveCardTo(effect.trainerCard, player.supporter);

  const blocked: number[] = [];
  player.deck.cards.forEach((card, index) => {
    if (card instanceof PokemonCard && (card.tags.length === 0 || !card.tags.includes(CardTag.TERA))) {
      blocked.push(index);
    }
  });

  yield store.prompt(state, new ChooseCardsPrompt(
    player.id,
    GameMessage.CHOOSE_CARD_TO_HAND,
    player.deck,
    { superType: SuperType.POKEMON },
    { min: 1, max: 1, allowCancel: true, blocked }
  ), selected => {
    cards = selected || [];
    next();
  });


  if (cards.length > 0) {
    yield store.prompt(state, new ShowCardsPrompt(
      opponent.id,
      GameMessage.CARDS_SHOWED_BY_THE_OPPONENT,
      cards
    ), () => next());
    player.deck.moveCardsTo(cards, player.hand);
    player.supporter.moveCardTo(effect.trainerCard, player.discard);
  } else {
    player.supporter.moveCardTo(effect.trainerCard, player.hand);

  }

  return store.prompt(state, new ShufflePrompt(player.id), order => {
    player.deck.applyOrder(order);
  });
}

export class TeraOrb extends TrainerCard {

  public id: number = 189;

  public trainerType: TrainerType = TrainerType.ITEM;

  public set: string = 'SSP';

  public name: string = 'Tera Orb';

  public fullName: string = 'Tera Orb SSP';

  public text: string =
    'Search your deck for a Tera Pokémon, reveal it, and put it into your hand. Then, shuffle your deck.';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }

}
