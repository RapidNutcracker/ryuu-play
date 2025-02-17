import { TrainerCard } from '../../../game/store/card/trainer-card';
import { CardTag, TrainerType } from '../../../game/store/card/card-types';
import { StoreLike } from '../../../game/store/store-like';
import { State } from '../../../game/store/state/state';
import { Effect } from '../../../game/store/effects/effect';
import { TrainerEffect } from '../../../game/store/effects/play-card-effects';
import { GameMessage } from '../../../game/game-message';
import { ChoosePokemonPrompt } from '../../../game/store/prompts/choose-pokemon-prompt';
import { PlayerType, SlotType } from '../../../game/store/actions/play-card-action';
import { StateUtils } from '../../../game/store/state-utils';
import { GameError } from '../../../game/game-error';

function* playCard(next: Function, store: StoreLike, state: State, self: PrimeCatcher, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);

  // Don't allow to play when opponent has an empty bench
  const opponentBenchCount = opponent.bench.reduce((sum, b) => {
    return sum + (b.cards.length > 0 ? 1 : 0);
  }, 0);

  if (opponentBenchCount === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  yield store.prompt(state, new ChoosePokemonPrompt(
    player.id,
    GameMessage.CHOOSE_POKEMON_TO_SWITCH,
    PlayerType.TOP_PLAYER,
    [SlotType.BENCH],
    { allowCancel: false }
  ), targets => {
    if (!targets || targets.length === 0) {
      return;
    }

    opponent.switchPokemon(targets[0]);
    next();
  });

  const playerBenchCount = player.bench.reduce((sum, b) => {
    return sum + (b.cards.length > 0 ? 1 : 0);
  }, 0);

  if (playerBenchCount === 0) {
    return state;
  }

  yield store.prompt(state, new ChoosePokemonPrompt(
    player.id,
    GameMessage.CHOOSE_POKEMON_TO_SWITCH,
    PlayerType.BOTTOM_PLAYER,
    [SlotType.BENCH],
    { allowCancel: false }
  ), targets => {
    if (!targets || targets.length === 0) {
      return;
    }

    player.switchPokemon(targets[0]);
    next();
  });

  return state;
}

export class PrimeCatcher extends TrainerCard {

  public id: number = 172;

  public tags: string[] = [CardTag.ACE_SPEC];

  public trainerType: TrainerType = TrainerType.ITEM;

  public set: string = 'TEF';

  public name: string = 'Prime Catcher';

  public fullName: string = 'Prime Catcher TEF';

  public text: string =
    'Switch in 1 of your opponent\'s Benched Pokémon to the Active Spot. ' +
    'If you do, switch your Active Pokémon with 1 of your Benched Pokémon.';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, this, effect);
      return generator.next().value;
    }

    return state;
  }

}
