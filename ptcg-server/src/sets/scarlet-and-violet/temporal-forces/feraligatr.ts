import {
  Attack,
  GameError,
  PlayerType,
  PokemonCardList,
  Power,
  PowerType,
  Resistance,
  State,
  StateUtils,
  StoreLike,
  Weakness,
} from '../../../game';
import { GameMessage } from '../../../game/game-message';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Effect } from '../../../game/store/effects/effect';
import { DealDamageEffect } from '../../../game/store/effects/attack-effects';
import { AttackEffect, PowerEffect, UseAttackEffect } from '../../../game/store/effects/game-effects';
import { EndTurnEffect } from '../../../game/store/effects/game-phase-effects';

export class Feraligatr extends PokemonCard {

  public id: number = 41;

  public stage: Stage = Stage.STAGE_2;

  public evolvesFrom: string = 'Croconaw';

  public cardType: CardType = CardType.WATER;

  public hp: number = 180;

  public weakness: Weakness[] = [{ type: CardType.LIGHTNING }];

  public resistance: Resistance[] = [];

  public retreat: CardType[] = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public powers: Power[] = [{
    name: 'Torrential Heart',
    powerType: PowerType.ABILITY,
    useWhenInPlay: true,
    text:
      'Once during your turn, you may put 5 damage counters on this Pokémon. ' +
      'If you do, during this turn, attacks used by this Pokémon do 120 more damage ' +
      'to your opponent\'s Active Pokémon (before applying Weakness and Resistance).'
  }];

  public attacks: Attack[] = [{
    name: 'Giant Wave',
    cost: [CardType.WATER, CardType.WATER],
    damage: 160,
    text: 'During your next turn, this Pokémon can\'t use Giant Wave.'
  }];

  public set: string = 'TEF';

  public name: string = 'Feraligatr';

  public fullName: string = 'Feraligatr TEF';

  public readonly TORRENTIAL_HEART_MARKER = 'TORRENTIAL_HEART_MARKER';

  public readonly GIANT_WAVE_MARKER = 'GIANT_WAVE_MARKER';

  private GIANT_WAVE_MARKER_USED_TURN_NUMBER = 0;


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Torrential Heart
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const slot = StateUtils.findCardList(state, this);
      if (!(slot instanceof PokemonCardList)) {
        return state;
      }

      if (slot.marker.hasMarker(this.TORRENTIAL_HEART_MARKER, this)) {
        throw new GameError(GameMessage.POWER_ALREADY_USED);
      }

      slot.damage += 50;
      slot.marker.addMarker(this.TORRENTIAL_HEART_MARKER, this);

      return state;
    }

    // Torrential Heart Boost
    if (effect instanceof DealDamageEffect && effect.source.cards.includes(this)) {
      if (effect.source.marker.hasMarker(this.TORRENTIAL_HEART_MARKER, this)) {
        effect.damage += 120;
      }

      return state;
    }

    // Attempt to Use Giant Wave
    if (effect instanceof UseAttackEffect && effect.attack === this.attacks[0]) {
      if (effect.player.active.marker.hasMarker(this.GIANT_WAVE_MARKER, this)) {
        throw new GameError(GameMessage.BLOCKED_BY_EFFECT);
      }
    }

    // Use Giant Wave
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      player.active.marker.addMarker(this.GIANT_WAVE_MARKER, this);
      this.GIANT_WAVE_MARKER_USED_TURN_NUMBER = state.turn;

      return state;
    }

    // Clear Markers
    if (effect instanceof EndTurnEffect && state.turn > this.GIANT_WAVE_MARKER_USED_TURN_NUMBER) {
      effect.player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (cardList) => {
        cardList.marker.removeMarker(this.TORRENTIAL_HEART_MARKER, this);
        cardList.marker.removeMarker(this.GIANT_WAVE_MARKER, this);
      });
    }

    return state;
  }

}
