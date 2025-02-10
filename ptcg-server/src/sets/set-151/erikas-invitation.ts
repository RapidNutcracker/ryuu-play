import { Card } from '../../game/store/card/card';
import { TrainerCard } from '../../game/store/card/trainer-card';
import { TrainerType, SuperType, Stage } from '../../game/store/card/card-types';
import { StoreLike } from '../../game/store/store-like';
import { State } from '../../game/store/state/state';
import { Effect } from '../../game/store/effects/effect';
import { PlayPokemonEffect, TrainerEffect } from '../../game/store/effects/play-card-effects';
import { ChooseCardsPrompt } from '../../game/store/prompts/choose-cards-prompt';
import { GameMessage } from '../../game/game-message';
import { ShowCardsPrompt } from '../../game/store/prompts/show-cards-prompt';
import { StateUtils } from '../../game/store/state-utils';
import { GameError } from '../../game/game-error';
import { PokemonCardList } from '../../game/store/state/pokemon-card-list';
import { PokemonCard } from '../../game/store/card/pokemon-card';

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);

  const slots: PokemonCardList[] = opponent.bench.filter(b => b.cards.length === 0);

  if (slots.length === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  const opponentHasBasicPokemonInHand = opponent.hand.cards.filter(card =>
    card instanceof PokemonCard && card.stage === Stage.BASIC
  );

  if (!opponentHasBasicPokemonInHand) {
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
    GameMessage.CHOOSE_CARD_TO_PUT_ONTO_BENCH,
    opponent.hand,
    { superType: SuperType.POKEMON, stage: Stage.BASIC },
    { min: 1, max: 1, allowCancel: false }
  ), selected => {
    cards = selected || [];
    next();
  });

  for (let i = 0; i < cards.length; i++) {
    const playPokemonEffect = new PlayPokemonEffect(opponent, cards[i] as PokemonCard, slots[i]);
    state = store.reduceEffect(state, playPokemonEffect);

    if (store.hasPrompts()) {
      yield store.waitPrompt(state, () => next());
    }

    opponent.switchPokemon(slots[i]);
  }

  return state;
}

export class ErikasInvitation extends TrainerCard {

  public id: number = 160;

  public trainerType: TrainerType = TrainerType.SUPPORTER;

  public set: string = 'MEW';

  public name: string = 'Erika\'s Invitation';

  public fullName: string = 'Erika\'s Invitation MEW';

  public text: string =
    'Your opponent reveals their hand, and you put a Basic Pokémon you find there onto your opponent\'s Bench. ' +
    'If you put a Pokémon onto their Bench in this way, switch in that Pokémon to the Active Spot.';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }

}
