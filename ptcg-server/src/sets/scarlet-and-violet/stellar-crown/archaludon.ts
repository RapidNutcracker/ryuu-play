import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike } from '../../../game/store/store-like';
import { State } from '../../../game/store/state/state';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect, PowerEffect, UseAttackEffect } from '../../../game/store/effects/game-effects';
import { Power, PowerType, Resistance } from '../../../game/store/card/pokemon-types';
import { CheckProvidedEnergyEffect, CheckRetreatCostEffect } from '../../../game/store/effects/check-effects';
import { PlayerType } from '../../../game/store/actions/play-card-action';
import { StateUtils } from '../../../game/store/state-utils';
import { GameError } from '../../../game/game-error';
import { GameMessage } from '../../../game/game-message';
import { EndTurnEffect } from '../../../game/store/effects/game-phase-effects';

export class Archaludon extends PokemonCard {

  public id: number = 107;

  public tags: string[] = [];

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Duraludon';

  public cardTypes: CardType[] = [CardType.METAL];

  public hp: number = 180;

  public weakness = [{ type: CardType.FIRE }];

  public resistance: Resistance[] = [{ type: CardType.GRASS, value: -30 }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public powers: Power[] = [{
    name: 'Metal Bridge',
    powerType: PowerType.ABILITY,
    text:
      'All of your Pokémon that have {M} Energy attached have no Retreat Cost.'
  }];

  public attacks = [{
    name: 'Iron Blaster',
    cost: [CardType.METAL, CardType.METAL, CardType.COLORLESS],
    damage: 160,
    text: 'During your next turn, this Pokémon can\'t attack.'
  }];

  public set: string = 'SCR';

  public name: string = 'Archaludon';

  public fullName: string = 'Archaludon SCR';

  public readonly IRON_BLASTER_MARKER = 'IRON_BLASTER_MARKER';

  private IRON_BLASTER_MARKER_TURN: number = 0;


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    if (effect instanceof CheckRetreatCostEffect) {
      const player = effect.player;

      let hasArchaludonInPlay = false;
      player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (cardList, card) => {
        if (card === this) {
          hasArchaludonInPlay = true;
        }
      });

      if (!hasArchaludonInPlay) {
        return state;
      }

      const checkProvidedEnergyEffect = new CheckProvidedEnergyEffect(player, player.active);
      store.reduceEffect(state, checkProvidedEnergyEffect);

      const energyMap = checkProvidedEnergyEffect.energyMap;
      const hasMetalEnergyAttached = StateUtils.checkEnoughEnergy(energyMap, [CardType.METAL]);

      if (hasMetalEnergyAttached) {
        // Try to reduce PowerEffect, to check if something is blocking our ability
        try {
          const powerEffect = new PowerEffect(player, this.powers[0], this);
          store.reduceEffect(state, powerEffect);
        } catch {
          return state;
        }

        effect.cost = [];
      }

      return state;
    }

    // Iron Blaster
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      player.active.marker.addMarker(this.IRON_BLASTER_MARKER, this);
      this.IRON_BLASTER_MARKER_TURN = state.turn;
    }

    // Tried to attack while Iron Blaster active
    if (effect instanceof UseAttackEffect && effect.player.active.marker.hasMarker(this.IRON_BLASTER_MARKER, this)) {
      throw new GameError(GameMessage.BLOCKED_BY_EFFECT);
    }

    // Clear Iron Blaster
    if (effect instanceof EndTurnEffect && state.turn > this.IRON_BLASTER_MARKER_TURN) {
      effect.player.active.marker.removeMarker(this.IRON_BLASTER_MARKER, this);
    }

    return state;
  }

}
