import { TrainerCard } from '../../game/store/card/trainer-card';
import { TrainerType } from '../../game/store/card/card-types';
import { StoreLike } from '../../game/store/store-like';
import { State } from '../../game/store/state/state';
import { Effect } from '../../game/store/effects/effect';
import { TrainerEffect } from '../../game/store/effects/play-card-effects';
import { GameMessage } from '../../game/game-message';
import { ChoosePokemonPrompt } from '../../game/store/prompts/choose-pokemon-prompt';
import { PlayerType, SlotType } from '../../game/store/actions/play-card-action';
import { StateUtils } from '../../game/store/state-utils';
import { GameError } from '../../game/game-error';

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);

  // Don't allow to play both blowers,
  // when opponen has an empty bench
  const benchCount = opponent.bench.reduce((sum, b) => {
    return sum + (b.cards.length > 0 ? 1 : 0);
  }, 0);


  if (benchCount == 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  return store.prompt(state, new ChoosePokemonPrompt(
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
  });
}

export class GustOfWind extends TrainerCard {

  public trainerType: TrainerType = TrainerType.ITEM;

  public set: string = 'BS';

  public name: string = 'Gust of Wind';

  public fullName: string = 'Gust of Wind BS';

  public text: string =
    'Choose 1 of your opponent\'s Benched Pokémon and switch it with his or her Active Pokémon.';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }

}
