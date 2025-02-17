import { AttackEffect } from '../../../game/store/effects/game-effects';
import { Effect } from '../../../game/store/effects/effect';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import {
  StoreLike,
  State,
  Resistance,
  Weakness,
  StateUtils,
  GamePhase,
  PlayerType,
  Attack,
} from '../../../game';
import { PutDamageEffect } from '../../../game/store/effects/attack-effects';
import { EndTurnEffect } from '../../../game/store/effects/game-phase-effects';

export class Nidoqueen extends PokemonCard {

  public id: number = 31;

  public stage: Stage = Stage.STAGE_2;

  public evolvesFrom: string = 'Nidorina';

  public cardType: CardType = CardType.DARKNESS;

  public hp: number = 170;

  public weakness: Weakness[] = [{ type: CardType.FIGHTING }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public attacks: Attack[] = [{
    name: 'Queen Press',
    cost: [CardType.DARKNESS, CardType.COLORLESS],
    damage: 90,
    text:
      'During your opponent\'s next turn, prevent all damage ' +
      'done to this Pokémon by attacks from Basic Pokémon.'
  }, {
    name: 'Lunge Out',
    cost: [CardType.DARKNESS, CardType.DARKNESS, CardType.COLORLESS],
    damage: 160,
    text: ''
  }];

  public set: string = 'MEW';

  public name: string = 'Nidoqueen';

  public fullName: string = 'Nidoqueen MEW';

  public readonly QUEEN_PRESS_MARKER: string = 'QUEEN_PRESS_MARKER';

  public readonly CLEAR_QUEEN_PRESS_MARKER: string = 'CLEAR_QUEEN_PRESS_MARKER';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Queen Press
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      player.active.marker.addMarker(this.QUEEN_PRESS_MARKER, this);
      opponent.marker.addMarker(this.CLEAR_QUEEN_PRESS_MARKER, this);

      return state;
    }

    // Queen Press is Active
    if (effect instanceof PutDamageEffect && effect.target.cards.includes(this)) {
      const pokemonCard = effect.target.getPokemonCard();
      const sourceCard = effect.source.getPokemonCard();

      // Card is not active, or damage source is unknown
      if (pokemonCard !== this || sourceCard === undefined) {
        return state;
      }

      // Do not ignore self-damage
      const player = StateUtils.findOwner(state, effect.target);
      const opponent = StateUtils.findOwner(state, effect.source);
      if (player === opponent) {
        return state;
      }

      // It's not an attack
      if (state.phase !== GamePhase.ATTACK) {
        return state;
      }

      // Prevent damage from Basic Pokémon
      if (sourceCard.stage === Stage.BASIC) {
        effect.preventDefault = true;
      }
    }

    // Clear Queen Press
    if (effect instanceof EndTurnEffect && effect.player.marker.hasMarker(this.CLEAR_QUEEN_PRESS_MARKER, this)) {

      effect.player.marker.removeMarker(this.CLEAR_QUEEN_PRESS_MARKER, this);

      const opponent = StateUtils.getOpponent(state, effect.player);
      opponent.forEachPokemon(PlayerType.TOP_PLAYER, (cardList) => {
        cardList.marker.removeMarker(this.QUEEN_PRESS_MARKER, this);
      });
    }

    return state;
  }

}
