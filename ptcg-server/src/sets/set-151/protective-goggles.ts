import { TrainerCard } from '../../game/store/card/trainer-card';
import { Stage, TrainerType } from '../../game/store/card/card-types';
import { StoreLike } from '../../game/store/store-like';
import { State } from '../../game/store/state/state';
import { Effect } from '../../game/store/effects/effect';
import { CheckPokemonStatsEffect } from '../../game/store/effects/check-effects';

export class ProtectiveGoggles extends TrainerCard {

  public id: number = 164;

  public trainerType: TrainerType = TrainerType.TOOL;

  public set: string = 'MEW';

  public name: string = 'Protective Goggles';

  public fullName: string = 'Protective Goggles MEW';

  public text: string =
    'The Basic Pokémon this card is attached to has no Weakness.';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof CheckPokemonStatsEffect && effect.target.tool === this) {
      if (effect.target.getPokemonCard()?.stage === Stage.BASIC) {
        effect.weakness = [];
      }

      return state;
    }

    return state;
  }

}
