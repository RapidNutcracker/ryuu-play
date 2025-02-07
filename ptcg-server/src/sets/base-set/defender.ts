import { TrainerCard } from '../../game/store/card/trainer-card';
import { TrainerType } from '../../game/store/card/card-types';
import { StoreLike } from '../../game/store/store-like';
import { State } from '../../game/store/state/state';
import { Effect } from '../../game/store/effects/effect';
import { DealDamageEffect } from '../../game/store/effects/attack-effects';
import { TrainerEffect } from '../../game/store/effects/play-card-effects';
import { EndTurnEffect } from '../../game/store/effects/game-phase-effects';
import { PlayerType, StateUtils } from '../../game';

export class Defender extends TrainerCard {

  public trainerType: TrainerType = TrainerType.ITEM;

  public set: string = 'BS';

  public name: string = 'Defender';

  public fullName: string = 'Defender BS';

  public text: string =
    'Attach Defender to 1 of your Pokémon. ' +
    'At the end of your opponent\'s next turn, discard Defender. ' +
    'Damage done to that Pokémon by attacks is reduced by 20 (after applying Weakness and Resistance).';

  private readonly DEFENDER_MARKER = 'DEFENDER_MARKER';

  private readonly CLEAR_DEFENDER_MARKER = 'CLEAR_DEFENDER_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      player.marker.addMarker(this.DEFENDER_MARKER, this);
      opponent.marker.addMarker(this.CLEAR_DEFENDER_MARKER, this);
    }

    if (effect instanceof DealDamageEffect) {
      if (effect.target.marker.hasMarker(this.DEFENDER_MARKER, this) && effect.damage > 0) {
        effect.damage = Math.max(effect.damage - 20, 0);
      }
    }

    if (effect instanceof EndTurnEffect && effect.player.marker.hasMarker(this.CLEAR_DEFENDER_MARKER, this)) {

      effect.player.marker.removeMarker(this.CLEAR_DEFENDER_MARKER, this);

      const opponent = StateUtils.getOpponent(state, effect.player);
      opponent.forEachPokemon(PlayerType.TOP_PLAYER, (cardList) => {
        cardList.marker.removeMarker(this.DEFENDER_MARKER, this);
      });
    }

    return state;
  }

}
