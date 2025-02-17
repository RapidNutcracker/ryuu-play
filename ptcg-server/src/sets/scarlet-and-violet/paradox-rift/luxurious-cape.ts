import { TrainerCard } from '../../../game/store/card/trainer-card';
import { TrainerType } from '../../../game/store/card/card-types';
import { StoreLike } from '../../../game/store/store-like';
import { State, GamePhase } from '../../../game/store/state/state';
import { Effect } from '../../../game/store/effects/effect';
import { StateUtils } from '../../../game/store/state-utils';
import { CheckHpEffect } from '../../../game/store/effects/check-effects';
import { KnockOutEffect } from '../../../game/store/effects/game-effects';

export class LuxuriousCape extends TrainerCard {

  public id: number = 166;

  public trainerType: TrainerType = TrainerType.TOOL;

  public set: string = 'PAR';

  public name: string = 'Luxurious Cape';

  public fullName: string = 'Luxurious Cape PAR';

  public text: string =
    'If the Pokémon this card is attached to doesn\'t have a Rule Box, it gets +100 HP, ' +
    'and if it is Knocked Out by damage from an attack from your opponent\'s Pokémon, ' +
    'that player takes 1 more Prize card. (Pokémon ex, Pokémon V, etc. have Rule Boxes.)';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof CheckHpEffect && effect.target.tool === this) {
      /// TODO: Rule Box overhaul
      if (effect.target.getPokemonCard()?.tags.length === 0) {
        effect.hp += 100;
      }
    }

    if (effect instanceof KnockOutEffect && effect.target.tool === this) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      // Do not activate between turns, or when it's not opponents turn.
      if (state.phase !== GamePhase.ATTACK || state.players[state.activePlayer] !== opponent) {
        return state;
      }

      effect.prizeCount += 1;
    }

    return state;
  }

}
