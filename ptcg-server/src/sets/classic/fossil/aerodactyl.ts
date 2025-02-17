import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, Power, PowerType, Weakness, Resistance, GameError, GameMessage, StateUtils } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { EvolveEffect, KnockOutEffect, PowerEffect } from '../../../game/store/effects/game-effects';
import { PlayPokemonEffect } from '../../../game/store/effects/play-card-effects';

export class Aerodactyl extends PokemonCard {

  public id: number = 1;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Mysterious Fossil';

  public cardType: CardType = CardType.FIGHTING;

  public hp: number = 60;

  public weakness: Weakness[] = [{ type: CardType.GRASS }]

  public resistance: Resistance[] = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public powers: Power[] = [{
    name: 'Prehistoric Power',
    powerType: PowerType.POKEMON_POWER,
    text:
      'No more Evolution cards can be played. ' +
      'This power stops working while Aerodactyl is Asleep, Confused, or Paralyzed.'
  }];

  public attacks = [{
    name: 'Wing Attack',
    cost: [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS],
    damage: 30,
    text: ''
  }];

  public set: string = 'FO';

  public name: string = 'Aerodactyl';

  public fullName: string = 'Aerodactyl FO';

  private readonly PREHISTORIC_POWER_MARKER = 'PREHISTORIC_POWER_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Prehistoric Power
    if (effect instanceof PlayPokemonEffect || effect instanceof EvolveEffect) {
      if (effect.player.marker.hasMarker(this.PREHISTORIC_POWER_MARKER)) {

        const cardList = StateUtils.findCardList(state, this);
        const owner = StateUtils.findOwner(state, cardList);

        // Try to reduce PowerEffect, to check if something is blocking our ability
        try {
          const powerEffect = new PowerEffect(owner, this.powers[0], this);
          state = store.reduceEffect(state, powerEffect);
        } catch {
          return state;
        }


        effect.preventDefault = true;
        throw new GameError(GameMessage.BLOCKED_BY_ABILITY);
      }

      const player = effect.player;

      if (effect.pokemonCard === this) {
        const opponent = StateUtils.getOpponent(state, player);
        player.marker.addMarker(this.PREHISTORIC_POWER_MARKER, this);
        opponent.marker.addMarker(this.PREHISTORIC_POWER_MARKER, this);
      }

      return state;
    }

    // Remove Prehistoric Power Marker when Aerodactyl is Knocked Out
    if (effect instanceof KnockOutEffect && effect.target.getPokemonCard() === this) {
      const player = effect.player;

      if (player.marker.hasMarker(this.PREHISTORIC_POWER_MARKER, this)) {
        player.marker.removeMarker(this.PREHISTORIC_POWER_MARKER, this);

        const opponent = StateUtils.getOpponent(state, player);
        opponent.marker.removeMarker(this.PREHISTORIC_POWER_MARKER, this);
      }
    }

    return state;
  }
}