import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';
import { StoreLike, State, Resistance, Weakness, PlayerType, StateUtils } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect } from '../../game/store/effects/game-effects';
import { PutDamageEffect } from '../../game/store/effects/attack-effects';
import { EndTurnEffect } from '../../game/store/effects/game-phase-effects';

export class Geodude extends PokemonCard {

  public id: number = 74;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.FIGHTING;

  public hp: number = 80;

  public weakness: Weakness[] = [{ type: CardType.GRASS }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [{
    name: 'Stiffen',
    cost: [CardType.FIGHTING],
    damage: 0,
    text: 'During your opponent\'s next turn, this Pokémon takes 30 less damage from attacks (after applying Weakness and Resistance).'
  }, {
    name: 'Knuckle Punch',
    cost: [CardType.FIGHTING, CardType.COLORLESS],
    damage: 20,
    text: ''
  }];

  public set: string = 'MEW';

  public name: string = 'Geodude';

  public fullName: string = 'Geodude MEW';

  public readonly STIFFEN_MARKER = 'STIFFEN_MARKER';

  public readonly CLEAR_STIFFEN_MARKER = 'CLEAR_STIFFEN_MARKER';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Stiffen
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      player.active.marker.addMarker(this.STIFFEN_MARKER, this);
      opponent.marker.addMarker(this.CLEAR_STIFFEN_MARKER, this);

      return state;
    }

    // Stiffen is Active
    if (effect instanceof PutDamageEffect && effect.target.marker.hasMarker(this.STIFFEN_MARKER)) {
      effect.damage = Math.max(effect.damage - 30, 0);

      return state;
    }

    // Clear Stiffen
    if (effect instanceof EndTurnEffect && effect.player.marker.hasMarker(this.CLEAR_STIFFEN_MARKER, this)) {

      effect.player.marker.removeMarker(this.CLEAR_STIFFEN_MARKER, this);

      const opponent = StateUtils.getOpponent(state, effect.player);
      opponent.forEachPokemon(PlayerType.TOP_PLAYER, (cardList) => {
        cardList.marker.removeMarker(this.STIFFEN_MARKER, this);
      });
    }

    return state;
  }

}
