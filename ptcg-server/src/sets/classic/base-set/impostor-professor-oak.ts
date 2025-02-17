import { Effect } from '../../../game/store/effects/effect';
import { TrainerEffect } from '../../../game/store/effects/play-card-effects';
import { State } from '../../../game/store/state/state';
import { StoreLike } from '../../../game/store/store-like';
import { TrainerCard } from '../../../game/store/card/trainer-card';
import { TrainerType } from '../../../game/store/card/card-types';
import { ShufflePrompt, StateUtils } from '../../../game';

export class ImpostorProfessorOak extends TrainerCard {

  public trainerType: TrainerType = TrainerType.ITEM;

  public set: string = 'BS';

  public name: string = 'Impostor Professor Oak';

  public fullName: string = 'Impostor Professor Oak BS';

  public text: string =
    'Your opponent shuffles his or her hand into his or her deck, then draws 7 cards.';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      opponent.hand.moveTo(opponent.deck);

      return store.prompt(state, new ShufflePrompt(opponent.id), order => {
        opponent.deck.applyOrder(order);
        opponent.deck.moveTo(opponent.hand, 7);
      });
    }

    return state;
  }

}
