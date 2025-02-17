import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, GameError } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect, UseAttackEffect } from '../../../game/store/effects/game-effects';
import { GameMessage } from '../../../game/game-message';
import { EndTurnEffect } from '../../../game/store/effects/game-phase-effects';

export class Dragonair extends PokemonCard {

  public id: number = 148;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Dratini';

  public cardType: CardType = CardType.DRAGON;

  public hp: number = 100;

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [{
    name: 'Beat',
    cost: [CardType.WATER],
    damage: 20,
    text: ''
  }, {
    name: 'Aqua Slash',
    cost: [CardType.WATER, CardType.LIGHTNING],
    damage: 90,
    text: 'During your next turn, this Pokémon can\'t attack.'
  }];

  public set: string = 'MEW';

  public name: string = 'Dragonair';

  public fullName: string = 'Dragonair MEW';

  public readonly AQUA_SLASH_MARKER = 'AQUA_SLASH_MARKER';

  private AQUA_SLASH_MARKER_TURN = 0;


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Aqua Slash
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;

      player.active.marker.addMarker(this.AQUA_SLASH_MARKER, this);
      this.AQUA_SLASH_MARKER_TURN = state.turn;
    }

    // Tried to attack while Aqua Slash active
    if (effect instanceof UseAttackEffect && effect.player.active.marker.hasMarker(this.AQUA_SLASH_MARKER, this)) {
      throw new GameError(GameMessage.BLOCKED_BY_EFFECT);
    }

    // Clear Aqua Slash
    if (effect instanceof EndTurnEffect && state.turn > this.AQUA_SLASH_MARKER_TURN) {
      effect.player.active.marker.removeMarker(this.AQUA_SLASH_MARKER, this);
    }

    return state;
  }
}