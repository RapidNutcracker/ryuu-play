import { TrainerCard } from '../../../game/store/card/trainer-card';
import { TrainerType } from '../../../game/store/card/card-types';
import { StoreLike } from '../../../game/store/store-like';
import { State, GamePhase } from '../../../game/store/state/state';
import { Effect } from '../../../game/store/effects/effect';
import { KnockOutEffect } from '../../../game/store/effects/game-effects';
import { BetweenTurnsEffect } from '../../../game/store/effects/game-phase-effects';
import { Card } from '../../../game/store/card/card';

export class RescueScarf extends TrainerCard {

  public trainerType: TrainerType = TrainerType.TOOL;

  public set: string = 'DRX';

  public name: string = 'Rescue Scarf';

  public fullName: string = 'Rescue Scarf DRX';

  public text: string =
    'If the Pokémon this card is attached to is Knocked Out by damage from ' +
    'an attack, put that Pokémon into your hand. (Discard all cards ' +
    'attached to that Pokémon.)';

  public readonly RESCUE_SCARF_MARKER = 'RESCUE_SCARF_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof KnockOutEffect && effect.target.cards.includes(this)) {
      const player = effect.player;

      // Do not activate between turns, or when it's not opponents turn.
      if (state.phase !== GamePhase.ATTACK) {
        return state;
      }

      const target = effect.target;
      const cards = target.getPokemons();
      cards.forEach(card => {
        player.marker.addMarker(this.RESCUE_SCARF_MARKER, card);
      });
    }

    if (effect instanceof BetweenTurnsEffect) {
      state.players.forEach(player => {

        if (!player.marker.hasMarker(this.RESCUE_SCARF_MARKER)) {
          return;
        }

        const rescued: Card[] = player.marker.markers
          .filter(m => m.name === this.RESCUE_SCARF_MARKER)
          .map(m => m.source);

        player.discard.moveCardsTo(rescued, player.hand);
        player.marker.removeMarker(this.RESCUE_SCARF_MARKER);
      });
    }

    return state;
  }

}
