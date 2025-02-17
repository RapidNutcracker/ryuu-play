import { Effect } from '../../../game/store/effects/effect';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Attack, Resistance, Weakness } from '../../../game/store/card/pokemon-types';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { GamePhase, State } from '../../../game/store/state/state';
import { StateUtils } from '../../../game/store/state-utils';
import { StoreLike } from '../../../game/store/store-like';
import { PlayerType } from '../../../game';
import { EndTurnEffect } from '../../../game/store/effects/game-phase-effects';
import { PutDamageEffect } from '../../../game/store/effects/attack-effects';

export class Persian extends PokemonCard {

  public id: number = 42;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Meowth';

  public cardTypes: CardType[] = [CardType.COLORLESS];

  public hp: number = 70;

  public weakness: Weakness[] = [{ type: CardType.FIGHTING }];

  public resistance: Resistance[] = [{ type: CardType.PSYCHIC, value: -30 }];

  public retreat = [];

  public attacks: Attack[] = [{
    name: 'Scratch',
    cost: [CardType.COLORLESS, CardType.COLORLESS],
    damage: 20,
    text: ''
  }, {
    name: 'Pounce',
    cost: [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS],
    damage: 30,
    text:
      'If the Defending Pokémon attacks Persian during your opponent\'s next turn, ' +
      'any damage done by the attack is reduced by 10 (after applying Weakness and Resistance). ' +
      '(Benching either Pokémon ends this effect.)'
  }];

  public set: string = 'JU';

  public name: string = 'Persian';

  public fullName: string = 'Persian JU';

  public readonly POUNCE_MARKER = 'POUNCE_MARKER';

  public readonly CLEAR_POUNCE_MARKER = 'CLEAR_POUNCE_MARKER';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Pounce
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      player.active.marker.addMarker(this.POUNCE_MARKER, this);
      opponent.active.marker.addMarker(this.POUNCE_MARKER, this);
      opponent.marker.addMarker(this.CLEAR_POUNCE_MARKER, this);

      return state;
    }

    // Pounce is Active
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
      if (
        effect.source.marker.hasMarker(this.POUNCE_MARKER, this) &&
        effect.target.marker.hasMarker(this.POUNCE_MARKER, this)
      ) {
        effect.damage = Math.max(effect.damage - 10, 0);
      }
    }

    // Clear Pounce
    if (effect instanceof EndTurnEffect && effect.player.marker.hasMarker(this.CLEAR_POUNCE_MARKER, this)) {

      effect.player.marker.removeMarker(this.CLEAR_POUNCE_MARKER, this);
      effect.player.forEachPokemon(PlayerType.TOP_PLAYER, (cardList) => {
        cardList.marker.removeMarker(this.POUNCE_MARKER, this);
      });

      const opponent = StateUtils.getOpponent(state, effect.player);
      opponent.forEachPokemon(PlayerType.TOP_PLAYER, (cardList) => {
        cardList.marker.removeMarker(this.POUNCE_MARKER, this);
      });
    }

    return state;
  }
}
