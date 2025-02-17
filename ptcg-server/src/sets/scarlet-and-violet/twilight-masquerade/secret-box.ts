import { TrainerCard } from '../../../game/store/card/trainer-card';
import { TrainerType, CardTag, SuperType } from '../../../game/store/card/card-types';
import { StoreLike } from '../../../game/store/store-like';
import { State } from '../../../game/store/state/state';
import { Effect } from '../../../game/store/effects/effect';
import { TrainerEffect } from '../../../game/store/effects/play-card-effects';
import { GameError } from '../../../game/game-error';
import { GameMessage } from '../../../game/game-message';
import { Card } from '../../../game/store/card/card';
import { ChooseCardsPrompt } from '../../../game/store/prompts/choose-cards-prompt';
import { ShufflePrompt } from '../../../game/store/prompts/shuffle-prompt';
import { ShowCardsPrompt } from '../../../game/store/prompts/show-cards-prompt';
import { StateUtils } from '../../../game';


function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);

  let cards: Card[] = [];

  cards = player.hand.cards.filter(c => c !== effect.trainerCard);
  if (cards.length < 3) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  if (player.deck.cards.length === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  // We will discard this card after prompt confirmation
  effect.preventDefault = true;
  player.hand.moveCardTo(effect.trainerCard, player.supporter);

  yield store.prompt(state, new ChooseCardsPrompt(
    player.id,
    GameMessage.CHOOSE_CARD_TO_DISCARD,
    player.hand,
    {},
    { min: 3, max: 3, allowCancel: true }
  ), selected => {
    cards = selected || [];
    next();
  });

  // Operation canceled by the user
  if (cards.length === 0) {
    player.supporter.moveCardTo(effect.trainerCard, player.hand);
    return state;
  }

  player.hand.moveCardsTo(cards, player.discard);

  yield store.prompt(state, new ChooseCardsPrompt(
    player.id,
    GameMessage.CHOOSE_CARD_TO_HAND,
    player.deck,
    { superType: SuperType.TRAINER },
    {
      min: 1, max: 4, allowCancel: false, cardMap: [
        { trainerType: TrainerType.ITEM },
        { trainerType: TrainerType.TOOL },
        { trainerType: TrainerType.SUPPORTER },
        { trainerType: TrainerType.STADIUM },
      ]
    }
  ), selected => {
    cards = selected || [];
    next();
  });

  yield store.prompt(state, new ShowCardsPrompt(
    opponent.id,
    GameMessage.CARDS_SHOWED_BY_EFFECT,
    cards
  ), () => {
    next();
  })

  player.deck.moveCardsTo(cards, player.hand);
  player.supporter.moveCardTo(effect.trainerCard, player.discard);

  return store.prompt(state, new ShufflePrompt(player.id), order => {
    player.deck.applyOrder(order);
  });
}

export class SecretBox extends TrainerCard {

  public id: number = 163;

  public trainerType: TrainerType = TrainerType.ITEM;

  public tags = [CardTag.ACE_SPEC];

  public set: string = 'TWM';

  public name: string = 'Secret Box';

  public fullName: string = 'Secret Box TWM';

  public text: string =
    'You can use this card only if you discard 3 other cards from your hand.' +
    '\n' +
    'Search your deck for an Item card, a Pokémon Tool card, a Supporter card, and a Stadium card, ' +
    'reveal them, and put them into your hand.Then, shuffle your deck.';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, effect);
      return generator.next().value;
    }
    return state;
  }

}
