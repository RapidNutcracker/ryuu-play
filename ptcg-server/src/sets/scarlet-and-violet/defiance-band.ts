import { TrainerCard } from '../../game/store/card/trainer-card';
import { TrainerType } from '../../game/store/card/card-types';
import { StoreLike } from '../../game/store/store-like';
import { State } from '../../game/store/state/state';
import { Effect } from '../../game/store/effects/effect';
import { StateUtils } from '../../game/store/state-utils';
import { DealDamageEffect } from '../../game/store/effects/attack-effects';

export class DefianceBand extends TrainerCard {

  public id: number = 169;

  public trainerType: TrainerType = TrainerType.TOOL;

  public set: string = 'SVI';

  public name: string = 'Defiance Band';

  public fullName: string = 'Defiance Band SVI';

  public text: string =
    'If you have more Prize cards remaining than your opponent, ' +
    'the attacks of the Pokémon this card is attached to do 30 more damage ' +
    'to your opponent\'s Active Pokémon (before applying Weakness and Resistance).';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    if (effect instanceof DealDamageEffect && effect.source.tool === this) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      const playerHasMorePrizesThanOpponent = player.getPrizeLeft() > opponent.getPrizeLeft();

      if (playerHasMorePrizesThanOpponent && effect.target === opponent.active) {
        effect.damage += 30;
      }
    }

    return state;
  }

}
