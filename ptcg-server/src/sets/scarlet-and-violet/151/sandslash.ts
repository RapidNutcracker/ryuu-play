import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, Resistance, Weakness, Attack, Power, GameError } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect, RetreatEffect } from '../../../game/store/effects/game-effects';
import { GameMessage } from '../../../game/game-message';
import { EndTurnEffect } from '../../../game/store/effects/game-phase-effects';

export class Sandslash extends PokemonCard {

  public id: number = 28;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Sandshrew';

  public cardType: CardType = CardType.FIGHTING;

  public hp: number = 120;

  public weakness: Weakness[] = [{ type: CardType.GRASS }];

  public resistance: Resistance[] = [];

  public retreat: CardType[] = [CardType.COLORLESS, CardType.COLORLESS];

  public powers: Power[] = [];

  public attacks: Attack[] = [{
    name: 'Rumble',
    cost: [CardType.FIGHTING],
    damage: 30,
    text: 'During your opponent\'s next turn, the Defending Pokémon can\'t retreat.'
  }, {
    name: 'Spike Rend',
    cost: [CardType.FIGHTING, CardType.COLORLESS, CardType.COLORLESS],
    damage: 80,
    text: 'If your opponent\'s Active Pokémon already has any damage counters on it, this attack does 100 more damage.'
  }];

  public set: string = 'MEW';

  public name: string = 'Sandslash';

  public fullName: string = 'Sandslash MEW';

  public readonly RUMBLE_MARKER = 'RUMBLE_MARKER';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Rumble
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const opponent = effect.opponent;

      opponent.active.marker.addMarker(this.RUMBLE_MARKER, this);
    }

    // Spike Rend
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      if (effect.opponent.active.damage > 0) {
        effect.damage += 100;
      }

      return state;
    }

    // Rumble Active
    if (effect instanceof RetreatEffect && effect.player.active.marker.hasMarker(this.RUMBLE_MARKER, this)) {
      effect.preventDefault = true;
      throw new GameError(GameMessage.BLOCKED_BY_EFFECT);
    }

    // Clear Rumble
    if (effect instanceof EndTurnEffect && effect.player.active.marker.hasMarker(this.RUMBLE_MARKER, this)) {
      effect.player.active.marker.removeMarker(this.RUMBLE_MARKER, this);
    }

    return state;
  }

}
