import { Effect } from '../../../game/store/effects/effect';
import { State } from '../../../game/store/state/state';
import { StoreLike } from '../../../game/store/store-like';
import { TrainerType } from '../../../game/store/card/card-types';
import { TrainerCard } from '../../../game/store/card/trainer-card';
import { TrainerEffect } from '../../../game/store/effects/play-card-effects';

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;

  player.active.specialConditions = [];

  return state;
}

export class FullHeal extends TrainerCard {

  public trainerType: TrainerType = TrainerType.ITEM;

  public set: string = 'BS';

  public name: string = 'Full Heal';

  public fullName: string = 'Full Heal BS';

  public text: string = 'Your Active Pokémon is no longer Asleep, Confused, Paralyzed, or Poisoned.';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, effect);
      return generator.next().value;
    }
    return state;
  }

}
