import { TrainerCard } from '../../game/store/card/trainer-card';
import { Stage, SuperType, TrainerType } from '../../game/store/card/card-types';
import { StoreLike } from '../../game/store/store-like';
import { State } from '../../game/store/state/state';
import { Effect } from '../../game/store/effects/effect';
import { TrainerEffect } from '../../game/store/effects/play-card-effects';
import { GameError, GameMessage, Card, ChooseCardsPrompt, CardList, StateUtils, ShowCardsPrompt, ShufflePrompt } from '../../game';

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);

  // Do not discard the card yet
  effect.preventDefault = true;

  // Get face down prize slots
  const faceDownPrizeSlots = player.prizes.filter(p => p.isSecret);

  // All prizes are face-up
  if (faceDownPrizeSlots.length === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  // Reveal each face down prize to the player and add them to a CardList
  const prizeCards: CardList = new CardList();
  faceDownPrizeSlots.forEach(prizeSlot => {
    prizeSlot.isSecret = false;
    prizeSlot.cards.forEach(card => prizeCards.cards.push(card));
  });

  // Player selects a Basic Pokémon from among the revealed prize cards
  let selectedPrizes: Card[] = [];
  yield state = store.prompt(state, new ChooseCardsPrompt(
    player.id,
    GameMessage.CHOOSE_PRIZE_CARD,
    prizeCards,
    { superType: SuperType.POKEMON, stage: Stage.BASIC },
    { min: 0, max: 1, allowCancel: false }
  ), selected => {
    selectedPrizes = selected || [];
    next();
  });

  // If there were no Basic Pokémon among the prize cards, discard this card
  if (selectedPrizes.length === 0) {
    player.hand.moveCardTo(effect.trainerCard, player.discard);
  } else {
    // If the player chose a Basic Pokémon, reveal it to the opponent
    yield store.prompt(state, new ShowCardsPrompt(
      opponent.id,
      GameMessage.CARDS_SHOWED_BY_THE_OPPONENT,
      selectedPrizes
    ), () => next());

    // Move the Basic Pokémon to the player hand. Place Hisuian Heavy Ball among the prizes
    prizeCards.moveCardsTo(selectedPrizes, player.hand);
    player.hand.moveCardTo(effect.trainerCard, prizeCards);
  }

  // Shuffle the prize cards
  yield store.prompt(state, new ShufflePrompt(player.id, prizeCards), order => {
    prizeCards.applyOrder(order);
    next();
  });

  // Place the prize cards back into face-down prize slots
  let prizeCardIndex = 0;
  faceDownPrizeSlots.forEach(prizeSlot => {
    if (prizeSlot.cards.length === 1) {
      prizeSlot.isSecret = true;
      prizeSlot.cards[0] = prizeCards.cards[prizeCardIndex];
      prizeCardIndex += 1;
    }
  });

  return state;
}

export class HisuianHeavyBall extends TrainerCard {

  public id: number = 146;

  public trainerType: TrainerType = TrainerType.ITEM;

  public set: string = 'ASR';

  public name: string = 'Hisuian Heavy Ball';

  public fullName: string = 'Hisuian Heavy Ball ASR';

  public text: string =
    'Look at your face-down Prize cards. ' +
    'You may reveal a Basic Pokémon you find there, put it into your hand, ' +
    'and put this Hisuian Heavy Ball in its place as a face-down Prize card. ' +
    '(If you don\'t reveal a Basic Pokémon, put this card in the discard pile.) ' +
    'Then, shuffle your face-down Prize cards.';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}
