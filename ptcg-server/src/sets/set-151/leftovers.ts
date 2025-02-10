import { TrainerCard } from '../../game/store/card/trainer-card';
import { TrainerType } from '../../game/store/card/card-types';
import { StoreLike } from '../../game/store/store-like';
import { State } from '../../game/store/state/state';
import { Effect } from '../../game/store/effects/effect';
import { EndTurnEffect } from '../../game/store/effects/game-phase-effects';
import { HealEffect } from '../../game/store/effects/game-effects';

export class Leftovers extends TrainerCard {

  public id: number = 163;

  public trainerType: TrainerType = TrainerType.TOOL;

  public set: string = 'MEW';

  public name: string = 'Leftovers';

  public fullName: string = 'Leftovers MEW';

  public text: string =
    'At the end of your turn, ' +
    'if the Pokémon this card is attached to is in the Active Spot, ' +
    'heal 20 damage from it.';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof EndTurnEffect && effect.player.active.tool === this) {
      const player = effect.player;

      const healEffect = new HealEffect(player, player.active, 20);
      state = store.reduceEffect(state, healEffect);

      return state;
    }

    return state;
  }

}
