import { TrainerCard } from '../../game/store/card/trainer-card';
import { Stage, SuperType, TrainerType } from '../../game/store/card/card-types';
import { StoreLike } from '../../game/store/store-like';
import { State } from '../../game/store/state/state';
import { Effect } from '../../game/store/effects/effect';
import { ShufflePrompt } from '../../game/store/prompts/shuffle-prompt';
import { Card, ChooseCardsPrompt, GameError, GameMessage, PokemonCard, PokemonCardList, StateUtils } from '../../game';
import { UseStadiumEffect } from '../../game/store/effects/game-effects';
import { PlayPokemonEffect } from '../../game/store/effects/play-card-effects';


function* useStadium(next: Function, store: StoreLike, state: State, effect: UseStadiumEffect): IterableIterator<State> {
  const player = effect.player;
  const slots: PokemonCardList[] = player.bench.filter(b => b.cards.length === 0);

  if (slots.length === 0 || player.deck.cards.length === 0) {
    throw new GameError(GameMessage.CANNOT_USE_STADIUM);
  }

  const blocked: number[] = [];
  player.deck.cards.forEach((card, index) => {
    if (!(card instanceof PokemonCard && card.tags.length === 0)) {
      blocked.push(index);
    }
  });

  let cards: Card[] = [];
  yield store.prompt(state, new ChooseCardsPrompt(
    player.id,
    GameMessage.CHOOSE_CARD_TO_PUT_ONTO_BENCH,
    player.deck,
    { superType: SuperType.POKEMON, stage: Stage.BASIC },
    { min: 1, max: 1, allowCancel: true, blocked }
  ), selected => {
    cards = selected || [];
    next();
  });

  if (cards.length > 0) {
    player.stadiumUsedTurn = state.turn;

    cards.forEach((card, index) => {
      player.deck.moveCardTo(card, player.hand);
      // slots[index].pokemonPlayedTurn = state.turn;

      const playPokemonEffect = new PlayPokemonEffect(player, card as PokemonCard, slots[index]);
      state = store.reduceEffect(state, playPokemonEffect);
    });
  }

  return store.prompt(state, new ShufflePrompt(player.id), order => {
    player.deck.applyOrder(order);
  });
}


export class Artazon extends TrainerCard {

  public id: number = 171;

  public trainerType: TrainerType = TrainerType.STADIUM;

  public tags = [];

  public set: string = 'PAL';

  public name: string = 'Artazon';

  public fullName: string = 'Artazon PAL';

  public text: string =
    'Once during each player\'s turn, that player may search their deck ' +
    'for a Basic Pokémon that doesn\'t have a Rule Box and put it onto their Bench. ' +
    'Then, that player shuffles their deck. (Pokémon ex, Pokémon V, etc. have Rule Boxes.)';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof UseStadiumEffect && StateUtils.getStadiumCard(state) === this) {
      const generator = useStadium(() => generator.next(), store, state, effect);
      return generator.next().value;
    }


    return state;
  }

}
