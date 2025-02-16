import { TrainerCard } from '../../game/store/card/trainer-card';
import { TrainerType } from '../../game/store/card/card-types';
import { StoreLike } from '../../game/store/store-like';
import { State } from '../../game/store/state/state';
import { Effect } from '../../game/store/effects/effect';
import { ChoosePokemonPrompt } from '../../game/store/prompts/choose-pokemon-prompt';
import { TrainerEffect } from '../../game/store/effects/play-card-effects';
import { PlayerType, SlotType, GameError, GameMessage } from '../../game';
import { HealEffect } from '../../game/store/effects/game-effects';

export class SwitchCart extends TrainerCard {

  public id: number = 154;

  public trainerType: TrainerType = TrainerType.ITEM;

  public set: string = 'ASR';

  public name: string = 'Switch Cart';

  public fullName: string = 'Switch Cart ASR';

  public text: string =
    'Switch your Active Basic Pokémon with 1 of your Benched Pokémon. ' +
    'If you do, heal 30 damage from the Pokémon you moved to your Bench.';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const player = effect.player;
      const hasBench = player.bench.some(b => b.cards.length > 0);

      if (hasBench === false) {
        throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
      }

      // Do not discard the card yet
      effect.preventDefault = true;

      return store.prompt(state, new ChoosePokemonPrompt(
        player.id,
        GameMessage.CHOOSE_POKEMON_TO_SWITCH,
        PlayerType.BOTTOM_PLAYER,
        [SlotType.BENCH],
        { allowCancel: true }
      ), results => {
        if (results.length === 0) {
          return state;
        }

        const healEffect = new HealEffect(player, player.active, 30);
        state = store.reduceEffect(state, healEffect);

        // Discard trainer only when user selected a Pokémon
        player.hand.moveCardTo(effect.trainerCard, player.discard);

        player.switchPokemon(results[0]);

        return state;
      });
    }

    return state;
  }

}
