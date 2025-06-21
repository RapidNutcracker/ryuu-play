import { AttackEffect } from '../../../game/store/effects/game-effects';
import { Effect } from '../../../game/store/effects/effect';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import {
  StoreLike,
  State,
  Resistance,
  PlayerType,
  StateUtils
} from '../../../game';
import { PutDamageEffect } from '../../../game/store/effects/attack-effects';
import { EndTurnEffect } from '../../../game/store/effects/game-phase-effects';

export class Aron2 extends PokemonCard {

  public id: number = 49;

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.METAL];

  public hp: number = 40;

  public weakness = [{ type: CardType.FIRE }];

  public resistance: Resistance[] = [{ type: CardType.GRASS, value: -30 }];

  public retreat = [CardType.COLORLESS];

  public attacks = [{
    name: 'Teary Eyes',
    cost: [CardType.COLORLESS],
    damage: 0,
    text: 'During your opponent\'s next turn, any damage done to Aron by attacks is reduced by 10.'
  }, {
    name: 'Ram',
    cost: [CardType.COLORLESS, CardType.COLORLESS],
    damage: 20,
    text: ''
  }];

  public set: string = 'RS';

  public name: string = 'Aron';

  public fullName: string = '#49 Aron RS';

  public readonly TEARY_EYES_MARKER = 'TEARY_EYES_MARKER';

  public readonly CLEAR_TEARY_EYES_MARKER = 'CLEAR_TEARY_EYES_MARKER';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Teary Eyes
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      player.active.marker.addMarker(this.TEARY_EYES_MARKER, this);
      opponent.marker.addMarker(this.CLEAR_TEARY_EYES_MARKER, this);

      return state;
    }

    // Teary Eyes is Active
    if (effect instanceof PutDamageEffect && effect.target.cards.includes(this)) {
      const pokemonCard = effect.target.getPokemonCard();
      const sourceCard = effect.source.getPokemonCard();

      // Card is not active, or damage source is unknown
      if (pokemonCard !== this || sourceCard === undefined) {
        return state;
      }

      // Prevent damage from Basic Pokémon
      if (effect.target.marker.hasMarker(this.TEARY_EYES_MARKER, this)) {
        effect.damage = Math.max(effect.damage - 10, 0);
      }
    }

    // Clear Teary Eyes
    if (effect instanceof EndTurnEffect && effect.player.marker.hasMarker(this.CLEAR_TEARY_EYES_MARKER, this)) {
      effect.player.marker.removeMarker(this.CLEAR_TEARY_EYES_MARKER, this);
      effect.player.forEachPokemon(PlayerType.TOP_PLAYER, (cardList) => {
        cardList.marker.removeMarker(this.TEARY_EYES_MARKER, this);
      });
    }

    return state;
  }
}
