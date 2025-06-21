import { TrainerCard } from '../../../game/store/card/trainer-card';
import { CardType, EnergyType, SuperType, TrainerType } from '../../../game/store/card/card-types';
import { StoreLike } from '../../../game/store/store-like';
import { State } from '../../../game/store/state/state';
import { Effect } from '../../../game/store/effects/effect';
import { TrainerEffect } from '../../../game/store/effects/play-card-effects';
import { PlayerType, SlotType, GameError, GameMessage, EnergyCard, AttachEnergyPrompt, StateUtils, CardTarget } from '../../../game';
import { CheckPokemonTypeEffect } from '../../../game/store/effects/check-effects';

export class DarkPatch extends TrainerCard {

  public id: number = 139;

  public trainerType: TrainerType = TrainerType.ITEM;

  public set: string = 'ASR';

  public name: string = 'Dark Patch';

  public fullName: string = 'Dark Patch ASR';

  public text: string =
    'Attach a basic {D} Energy card from your discard pile to 1 of your Benched {D} Pokémon.';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const player = effect.player;

      const hasEnergyInDiscard = player.discard.cards.some(c => {
        return c instanceof EnergyCard
          && c.energyType === EnergyType.BASIC
          && c.provides.includes(CardType.DARKNESS);
      });
      if (!hasEnergyInDiscard) {
        throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
      }

      let hasDarkPokemonOnBench = false;
      const blockedTo: CardTarget[] = [];
      player.bench.forEach((bench, index) => {
        if (bench.cards.length === 0) {
          return;
        }
        const checkPokemonTypeEffect = new CheckPokemonTypeEffect(bench);
        store.reduceEffect(state, checkPokemonTypeEffect);

        if (checkPokemonTypeEffect.cardTypes.includes(CardType.DARKNESS)) {
          hasDarkPokemonOnBench = true;
        } else {
          const target: CardTarget = {
            player: PlayerType.BOTTOM_PLAYER,
            slot: SlotType.BENCH,
            index
          };
          blockedTo.push(target);
        }
      });

      if (!hasDarkPokemonOnBench) {
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
        { superType: SuperType.ENERGY, energyType: EnergyType.BASIC, provides: [CardType.DARKNESS] },
        { allowCancel: true, min: 1, max: 1, blockedTo }
      ), transfers => {
        transfers = transfers || [];

        if (transfers.length === 0) {
          player.supporter.moveCardTo(this, player.hand);
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
