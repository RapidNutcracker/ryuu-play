import { TrainerCard } from '../../../game/store/card/trainer-card';
import { CardType, TrainerType } from '../../../game/store/card/card-types';
import { StoreLike } from '../../../game/store/store-like';
import { State } from '../../../game/store/state/state';
import { Effect } from '../../../game/store/effects/effect';
import { CheckAttackCostEffect, CheckPokemonTypeEffect } from '../../../game/store/effects/check-effects';
import { StateUtils } from '../../../game';

export class CounterGain extends TrainerCard {

  public id: number = 169;

  public trainerType: TrainerType = TrainerType.TOOL;

  public set: string = 'SSP';

  public name: string = 'Counter Gain';

  public fullName: string = 'Counter Gain SSP';

  public text: string =
    'If you have more Prize cards remaining than your opponent, ' +
    'attacks used by the Pokémon this card is attached to cost {C} less.';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof CheckAttackCostEffect) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      if (player.getPrizeLeft() > opponent.getPrizeLeft()) {
        const index = effect.cost.indexOf(CardType.COLORLESS);

        // No cost to reduce
        if (index === -1) {
          return state;
        }

        const checkPokemonTypeEffect = new CheckPokemonTypeEffect(player.active);
        store.reduceEffect(state, checkPokemonTypeEffect);

        if (checkPokemonTypeEffect.cardTypes.includes(CardType.PSYCHIC)) {
          effect.cost.splice(index, 1);
        }

        return state;
      }
    }

    return state;
  }

}
