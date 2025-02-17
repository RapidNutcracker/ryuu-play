import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike } from '../../../game/store/store-like';
import { State } from '../../../game/store/state/state';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect, UseAttackEffect } from '../../../game/store/effects/game-effects';
import { StateUtils } from '../../../game/store/state-utils';
import { GameError } from '../../../game/game-error';
import { GameMessage } from '../../../game/game-message';
import { EndTurnEffect } from '../../../game/store/effects/game-phase-effects';

export class Lickitung extends PokemonCard {

  public id: number = 108;

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.COLORLESS];

  public hp: number = 100;

  public weakness = [{ type: CardType.FIGHTING }];

  public resistance = [];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [{
    name: 'Tongue-Tied',
    cost: [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS],
    damage: 70,
    text: 'During your opponent\'s next turn, the Defending Pokémon can\'t attack.'
  }];

  public set: string = 'MEW';

  public name: string = 'Lickitung';

  public fullName: string = 'Lickitung MEW';

  public readonly TONGUE_TIED_MARKER = 'TONGUE_TIED_MARKER';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Tongue-Tied
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);
      opponent.active.marker.addMarker(this.TONGUE_TIED_MARKER, this);
    }

    // Tongue-Tied is Active
    if (effect instanceof UseAttackEffect && effect.player.active.marker.hasMarker(this.TONGUE_TIED_MARKER, this)) {
      throw new GameError(GameMessage.BLOCKED_BY_EFFECT);
    }

    // Clear Tongue-Tied
    if (effect instanceof EndTurnEffect) {
      effect.player.active.marker.removeMarker(this.TONGUE_TIED_MARKER, this);
    }

    return state;
  }

}
