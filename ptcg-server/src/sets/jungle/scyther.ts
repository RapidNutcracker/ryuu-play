import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';
import { StoreLike, State } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { DealDamageEffect } from '../../game/store/effects/attack-effects';
import { AttackEffect } from '../../game/store/effects/game-effects';
import { EndTurnEffect } from '../../game/store/effects/game-phase-effects';

export class Scyther extends PokemonCard {

  public id: number = 10;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.GRASS;

  public hp: number = 70;

  public weakness = [{ type: CardType.FIRE }];

  public resistance = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [];

  public powers = [];

  public attacks = [
    {
      name: 'Swords Dance',
      cost: [CardType.GRASS],
      damage: 0,
      text:
        'During your next turn, Scyther\'s Slash attack\'s base damage is 60 instead of 30.'
    },
    {
      name: 'Slash',
      cost: [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS],
      damage: 30,
      text: ''
    },
  ];

  public set: string = 'JU';

  public name: string = 'Scyther';

  public fullName: string = 'Scyther JU';

  public readonly SWORDS_DANCE_MARKER = 'SWORDS_DANCE_MARKER';

  private SWORDS_DANCE_TURN_NUMBER: number = 0

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Swords Dance
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      player.active.marker.addMarker(this.SWORDS_DANCE_MARKER, this);
      this.SWORDS_DANCE_TURN_NUMBER = state.turn;

      return state;
    }

    // Slash
    if (effect instanceof DealDamageEffect && effect.attack === this.attacks[1]) {
      if (effect.source.marker.hasMarker(this.SWORDS_DANCE_MARKER)) {
        effect.damage = 60;
      }
    }

    // Clear Swords Dance
    if (effect instanceof EndTurnEffect &&
      effect.player.active.marker.hasMarker(this.SWORDS_DANCE_MARKER, this) &&
      state.turn > this.SWORDS_DANCE_TURN_NUMBER
    ) {
      effect.player.active.marker.removeMarker(this.SWORDS_DANCE_MARKER, this);
    }

    return state;
  }
}
