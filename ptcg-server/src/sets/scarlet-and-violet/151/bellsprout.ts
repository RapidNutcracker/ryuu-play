import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, Resistance, Weakness, Attack, Power, GameError } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect, RetreatEffect } from '../../../game/store/effects/game-effects';
import { GameMessage } from '../../../game/game-message';
import { EndTurnEffect } from '../../../game/store/effects/game-phase-effects';

export class Bellsprout extends PokemonCard {

  public id: number = 69;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.GRASS;

  public hp: number = 60;

  public weakness: Weakness[] = [{ type: CardType.FIRE }];

  public resistance: Resistance[] = [];

  public retreat: CardType[] = [CardType.COLORLESS];

  public powers: Power[] = [];

  public attacks: Attack[] = [{
    name: 'Cut',
    cost: [CardType.GRASS],
    damage: 10,
    text: ''
  }, {
    name: 'Bind Down',
    cost: [CardType.GRASS, CardType.COLORLESS],
    damage: 20,
    text: 'During your opponent\'s next turn, the Defending Pokémon can\'t retreat.'
  }];

  public set: string = 'MEW';

  public name: string = 'Bellsprout';

  public fullName: string = 'Bellsprout MEW';

  public readonly BIND_DOWN_MARKER = 'BIND_DOWN_MARKER';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Bind Down
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const opponent = effect.opponent;

      opponent.active.marker.addMarker(this.BIND_DOWN_MARKER, this);
    }

    // Bind Down Active
    if (effect instanceof RetreatEffect && effect.player.active.marker.hasMarker(this.BIND_DOWN_MARKER, this)) {
      effect.preventDefault = true;
      throw new GameError(GameMessage.BLOCKED_BY_EFFECT);
    }

    // Clear Bind Down
    if (effect instanceof EndTurnEffect && effect.player.active.marker.hasMarker(this.BIND_DOWN_MARKER, this)) {
      effect.player.active.marker.removeMarker(this.BIND_DOWN_MARKER, this);
    }

    return state;
  }

}
