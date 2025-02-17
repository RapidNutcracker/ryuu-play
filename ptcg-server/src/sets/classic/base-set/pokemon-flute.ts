import { GameError } from '../../../game/game-error';
import { GameMessage } from '../../../game/game-message';
import { TrainerCard } from '../../../game/store/card/trainer-card';
import { TrainerType, SuperType, Stage } from '../../../game/store/card/card-types';
import { StoreLike } from '../../../game/store/store-like';
import { State } from '../../../game/store/state/state';
import { Effect } from '../../../game/store/effects/effect';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { PokemonCardList } from '../../../game/store/state/pokemon-card-list';
import { TrainerEffect } from '../../../game/store/effects/play-card-effects';
import { ChooseCardsPrompt } from '../../../game/store/prompts/choose-cards-prompt';
import { StateUtils } from '../../../game';

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);

  const slots: PokemonCardList[] = opponent.bench.filter(b => b.cards.length === 0);

  // Opponent has no empty bench slot
  if (slots.length === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  // Opponent has no basic Pokémon in the discard pile
  if (!opponent.discard.cards.some(c => c instanceof PokemonCard && c.stage === Stage.BASIC)) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  // We will discard this card after prompt confirmation
  effect.preventDefault = true;
  player.hand.moveCardTo(effect.trainerCard, player.supporter);

  return store.prompt(state, new ChooseCardsPrompt(
    player.id,
    GameMessage.CHOOSE_CARD_TO_PUT_ONTO_BENCH,
    opponent.discard,
    { superType: SuperType.POKEMON, stage: Stage.BASIC },
    { min: 1, max: 1, allowCancel: true }
  ), selected => {
    if (selected && selected.length > 0) {
      // Discard trainer only when user selected a Pokémon
      player.supporter.moveCardTo(effect.trainerCard, player.discard);
      // Recover discarded Pokémon
      opponent.discard.moveCardsTo(selected, slots[0]);
    }
  });
}

export class PokemonFlute extends TrainerCard {

  public id: number = 86;

  public trainerType: TrainerType = TrainerType.ITEM;

  public set: string = 'BS';

  public name: string = 'Pokémon Flute';

  public fullName: string = 'Pokémon Flute BS';

  public text: string =
    'Choose 1 Basic Pokémon card from your opponent\'s discard pile and put it onto his or her Bench. ' +
    '(You can\'t play Pokémon Flute if your opponent\'s Bench is full.)';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }

}
