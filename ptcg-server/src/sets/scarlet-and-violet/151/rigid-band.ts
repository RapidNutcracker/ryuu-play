import { TrainerCard } from '../../../game/store/card/trainer-card';
import { Stage, TrainerType } from '../../../game/store/card/card-types';
import { StoreLike } from '../../../game/store/store-like';
import { GamePhase, State } from '../../../game/store/state/state';
import { Effect } from '../../../game/store/effects/effect';
import { PutDamageEffect } from '../../../game/store/effects/attack-effects';

export class RigidBand extends TrainerCard {

  public id: number = 165;

  public trainerType: TrainerType = TrainerType.TOOL;

  public set: string = 'MEW';

  public name: string = 'Rigid Band';

  public fullName: string = 'Rigid Band MEW';

  public text: string =
    'The Stage 1 Pokémon this card is attached to takes 30 less damage ' +
    'from attacks from your opponent\'s Pokémon (after applying Weakness and Resistance).';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PutDamageEffect && effect.target.tool === this) {
      if (state.phase === GamePhase.ATTACK && effect.target.getPokemonCard()?.stage === Stage.STAGE_1) {
        effect.damage = Math.max(effect.damage - 30, 0);
      }

      return state;
    }

    return state;
  }

}
