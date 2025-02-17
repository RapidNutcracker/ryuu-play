import { TrainerCard } from '../../../game/store/card/trainer-card';
import { Stage, SuperType, TrainerType } from '../../../game/store/card/card-types';
import { StoreLike } from '../../../game/store/store-like';
import { State } from '../../../game/store/state/state';
import { Effect } from '../../../game/store/effects/effect';
import { TrainerEffect } from '../../../game/store/effects/play-card-effects';
import { ShufflePrompt } from '../../../game/store/prompts/shuffle-prompt';
import { Card, ChooseCardsPrompt, GameError, GameMessage, PokemonCardList } from '../../../game';


function* playCard(next: Function, store: StoreLike, state: State, self: NestBall, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;
  
  const emptyBenchSlots: PokemonCardList[] = player.bench.filter(b => b.cards.length === 0);
  const max = Math.min(emptyBenchSlots.length, 1);

  if (emptyBenchSlots.length === 0 || player.deck.cards.length === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  effect.preventDefault = true;
  player.hand.moveCardTo(self, player.supporter);

  let cards: Card[] = [];
  yield store.prompt(state, new ChooseCardsPrompt(
    player.id,
    GameMessage.CHOOSE_CARD_TO_PUT_ONTO_BENCH,
    player.deck,
    { superType: SuperType.POKEMON, stage: Stage.BASIC },
    { min: 1, max, allowCancel: true }
  ), selected => {
    cards = selected || [];
    next();
  });

  if (cards.length > emptyBenchSlots.length) {
    cards.length = emptyBenchSlots.length;
  }

  cards.forEach((card, index) => {
    player.deck.moveCardTo(card, emptyBenchSlots[index]);
    emptyBenchSlots[index].pokemonPlayedTurn = state.turn;
  });

  player.supporter.moveCardTo(self, player.discard);

  return store.prompt(state, new ShufflePrompt(player.id), order => {
    player.deck.applyOrder(order);
  });
}

export class NestBall extends TrainerCard {

  public id: number = 181;

  public trainerType: TrainerType = TrainerType.ITEM;

  public tags = [];

  public set: string = 'SVI';

  public name: string = 'Nest Ball';

  public fullName: string = 'Nest Ball SVI';

  public text: string =
    'Search your deck for a Basic Pokémon and put it onto your Bench. Then, shuffle your deck.';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, this, effect);
      return generator.next().value;
    }

    return state;
  }

}
