import { TrainerCard } from '../../../game/store/card/trainer-card';
import { TrainerType, EnergyType, SuperType } from '../../../game/store/card/card-types';
import { StoreLike } from '../../../game/store/store-like';
import { State } from '../../../game/store/state/state';
import { Effect } from '../../../game/store/effects/effect';
import { StateUtils } from '../../../game/store/state-utils';
import { TrainerEffect } from '../../../game/store/effects/play-card-effects';
import { GameError } from '../../../game/game-error';
import { GameMessage } from '../../../game/game-message';
import { EnergyCard } from '../../../game/store/card/energy-card';
import { AttachEnergyPrompt } from '../../../game/store/prompts/attach-energy-prompt';
import { PlayerType, SlotType } from '../../../game/store/actions/play-card-action';

export class EnergySticker extends TrainerCard {

  public id: number = 159;

  public trainerType: TrainerType = TrainerType.ITEM;

  public set: string = 'MEW';

  public name: string = 'Energy Sticker';

  public fullName: string = 'Energy Sticker MEW';

  public text: string =
    'Flip a coin. If heads, attach a Basic Energy card ' +
    'from your discard pile to 1 of your Benched Pokémon.'

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const player = effect.player;

      const hasEnergyInDiscard = player.discard.cards.some(c => {
        return c instanceof EnergyCard
          && c.energyType === EnergyType.BASIC;
      });

      if (!hasEnergyInDiscard) {
        throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
      }

      let hasBenchedPokemon = player.bench.some(bench => bench.cards.length > 0);

      if (!hasBenchedPokemon) {
        throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
      }

      // We will discard this card after prompt confirmation
      effect.preventDefault = true;
      player.hand.moveCardTo(this, player.supporter);

      state = store.prompt(state, new AttachEnergyPrompt(
        player.id,
        GameMessage.ATTACH_ENERGY_TO_BENCH,
        player.discard,
        PlayerType.BOTTOM_PLAYER,
        [SlotType.BENCH],
        { superType: SuperType.ENERGY, energyType: EnergyType.BASIC },
        { min: 1, max: 1, allowCancel: true }
      ), transfers => {
        transfers = transfers || [];

        if (transfers.length === 0) {
          return;
        }

        for (const transfer of transfers) {
          const target = StateUtils.getTarget(state, player, transfer.to);
          player.discard.moveCardTo(transfer.card, target);
        }

        player.supporter.moveCardTo(this, player.discard);
      });
    }

    return state;
  }

}
