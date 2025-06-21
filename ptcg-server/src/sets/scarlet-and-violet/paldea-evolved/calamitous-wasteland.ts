import { TrainerCard } from '../../../game/store/card/trainer-card';
import { CardType, Stage, TrainerType } from '../../../game/store/card/card-types';
import { StoreLike } from '../../../game/store/store-like';
import { State } from '../../../game/store/state/state';
import { Effect } from '../../../game/store/effects/effect';
import { StateUtils } from '../../../game';
import { CheckRetreatCostEffect } from '../../../game/store/effects/check-effects';

export class CalamitousWasteland extends TrainerCard {

  public id: number = 175;

  public trainerType: TrainerType = TrainerType.STADIUM;

  public tags = [];

  public set: string = 'PAL';

  public name: string = 'Calamitous Wasteland';

  public fullName: string = 'Calamitous Wasteland PAL';

  public text: string =
    'The Retreat Cost of each Basic non-{F} Pokémon in play (both yours and your opponent\'s) is {C} more.';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof CheckRetreatCostEffect && StateUtils.getStadiumCard(state) === this) {
      const player = effect.player;
      const pokemonCard = player.active.getPokemonCard();

      if (pokemonCard && pokemonCard.stage == Stage.BASIC && !pokemonCard.cardTypes.includes(CardType.FIGHTING)) {
        effect.cost.push(CardType.COLORLESS);
      }
    }

    return state;
  }

}
