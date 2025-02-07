import { AfterDamageEffect } from '../../game/store/effects/attack-effects';
import { AttackEffect, PowerEffect } from '../../game/store/effects/game-effects';
import { Effect } from '../../game/store/effects/effect';
import { EndTurnEffect } from '../../game/store/effects/game-phase-effects';
import { GamePhase, Power, PowerType, State, StateUtils, StoreLike } from '../../game';
import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';

export class Hitmonchan extends PokemonCard {

  public id: number = 107;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.FIGHTING;

  public hp: number = 120;

  public weakness = [{ type: CardType.PSYCHIC }];

  public retreat = [CardType.COLORLESS];

  public powers: Power[] = [{
    name: 'Counterattack',
    powerType: PowerType.ABILITY,
    text:
      'If this Pokémon is in the Active Spot and is damaged by an attack from your opponent\'s Pokémon ' +
      '(even if this Pokémon is Knocked Out), put 3 damage counters on the Attacking Pokémon.'
  }];

  public attacks = [
    {
      name: 'Excited Punch',
      cost: [CardType.FIGHTING, CardType.FIGHTING],
      damage: 60,
      text:
        'During your next turn, this Pokémon\'s Excited Punch attack does 60 more damage ' +
        '(before applying Weakness and Resistance).'
    }
  ];

  public set: string = 'MEW';

  public name: string = 'Hitmonchan';

  public fullName: string = 'Hitmonchan MEW';

  public readonly EXCITED_PUNCH_MARKER = 'EXCITED_PUNCH_MARKER';

  private EXCITED_PUNCH_MARKER_TURN_NUMBER: number = 0

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Counterattack
    if (effect instanceof AfterDamageEffect && effect.target.getPokemonCard() === this) {
      const player = effect.player;
      const targetPlayer = StateUtils.findOwner(state, effect.target);

      if (effect.damage <= 0 || player === targetPlayer || targetPlayer.active !== effect.target) {
        return state;
      }

      if (state.phase === GamePhase.ATTACK) {
        // Try to reduce PowerEffect, to check if something is blocking our ability
        try {
          const powerEffect = new PowerEffect(player, this.powers[0], this);
          state = store.reduceEffect(state, powerEffect);
        } catch {
          return state;
        }

        effect.source.damage += 30;
      }
    }

    // Excited Punch
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      if (player.active.marker.hasMarker(this.EXCITED_PUNCH_MARKER, this)) {
        effect.damage += 60;
      }

      player.active.marker.addMarker(this.EXCITED_PUNCH_MARKER, this);
      this.EXCITED_PUNCH_MARKER_TURN_NUMBER = state.turn;

      return state;
    }

    // Clear Excited Punch
    if (effect instanceof EndTurnEffect &&
      effect.player.active.marker.hasMarker(this.EXCITED_PUNCH_MARKER, this) &&
      state.turn > this.EXCITED_PUNCH_MARKER_TURN_NUMBER
    ) {
      effect.player.active.marker.removeMarker(this.EXCITED_PUNCH_MARKER, this);
    }

    return state;
  }
}
