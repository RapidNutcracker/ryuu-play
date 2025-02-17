import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, Resistance, Weakness, Attack, Power, PowerType, GameLog } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { PlayPokemonEffect } from '../../../game/store/effects/play-card-effects';
import { KnockOutEffect, PowerEffect } from '../../../game/store/effects/game-effects';

export class Relicanth extends PokemonCard {

  public id: number = 84;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.FIGHTING;

  public hp: number = 100;

  public weakness: Weakness[] = [{ type: CardType.GRASS }];

  public resistance: Resistance[] = [];

  public retreat: CardType[] = [CardType.COLORLESS];

  public powers: Power[] = [{
    name: 'Memory Dive',
    powerType: PowerType.ABILITY,
    text:
      'Each of your evolved Pokémon can use any attack from its previous Evolutions. ' +
      '(You still need the necessary Energy to use each attack.)'
  }];

  public attacks: Attack[] = [{
    name: 'Razor Fin',
    cost: [CardType.FIGHTING, CardType.COLORLESS],
    damage: 30,
    text: ''
  }];

  public set: string = 'TEF';

  public name: string = 'Relicanth';

  public fullName: string = 'Relicanth TEF';

  public readonly MEMORY_DIVE_MARKER = 'MEMORY_DIVE_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Apply Memory Dive Marker when put into play
    if (effect instanceof PlayPokemonEffect && effect.pokemonCard === this) {
      store.log(state, GameLog.LOG_TEXT, {
        text: `Played Relicanth`
      });

      // Try to reduce PowerEffect, to check if something is blocking our ability
      try {
        const powerEffect = new PowerEffect(effect.player, this.powers[0], this);
        state = store.reduceEffect(state, powerEffect);
      } catch {
        store.log(state, GameLog.LOG_TEXT, {
          text: `Failed to apply MEMORY_DIVE_MARKER`
        });

        return state;
      }

      effect.player.marker.addMarker(this.MEMORY_DIVE_MARKER, this);

      return state;
    }

    // Remove Memory Dive Marker when K/O'd
    if (effect instanceof KnockOutEffect && effect.target.getPokemonCard() === this) {
      effect.player.marker.removeMarker(this.MEMORY_DIVE_MARKER, this);
    }

    return state;
  }

}
