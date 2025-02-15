import { Effect } from '../../game/store/effects/effect';
import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Attack, Resistance, Weakness } from '../../game/store/card/pokemon-types';
import { AttackEffect } from '../../game/store/effects/game-effects';
import { Stage, CardType } from '../../game/store/card/card-types';
import { GamePhase, State } from '../../game/store/state/state';
import { StateUtils } from '../../game/store/state-utils';
import { StoreLike } from '../../game/store/store-like';
import { PlayerType } from '../../game';
import { EndTurnEffect } from '../../game/store/effects/game-phase-effects';
import { PutDamageEffect } from '../../game/store/effects/attack-effects';

export class Cubone extends PokemonCard {

  public id: number = 50;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.FIGHTING;

  public hp: number = 40;

  public weakness: Weakness[] = [{ type: CardType.GRASS }];

  public resistance: Resistance[] = [{ type: CardType.LIGHTNING, value: -30 }];

  public retreat = [CardType.COLORLESS];

  public attacks: Attack[] = [{
    name: 'Snivel',
    cost: [CardType.COLORLESS],
    damage: 0,
    text:
      'If the Defending Pokémon attacks Cubone during your opponent\'s next turn, ' +
      'any damage done by the attack is reduced by 20 (after applying Weakness and Resistance). ' +
      '(Benching either Pokémon ends this effect.)'
  }, {
    name: 'Rage',
    cost: [CardType.FIGHTING, CardType.FIGHTING],
    damage: 10,
    text:
      'Does 10 damage plus 10 more damage for each damage counter on Cubone.'
  }];

  public set: string = 'JU';

  public name: string = 'Cubone';

  public fullName: string = 'Cubone JU';

  public readonly SNIVEL_MARKER = 'SNIVEL_MARKER';

  public readonly CLEAR_SNIVEL_MARKER = 'CLEAR_SNIVEL_MARKER';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Snivel
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      player.active.marker.addMarker(this.SNIVEL_MARKER, this);
      opponent.active.marker.addMarker(this.SNIVEL_MARKER, this);
      opponent.marker.addMarker(this.CLEAR_SNIVEL_MARKER, this);

      return state;
    }

    // Rage
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      effect.damage += effect.player.active.damage;
    }

    // Snivel is Active
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
        effect.source.marker.hasMarker(this.SNIVEL_MARKER, this) &&
        effect.target.marker.hasMarker(this.SNIVEL_MARKER, this)
      ) {
        effect.damage = Math.max(effect.damage - 20, 0);
      }
    }

    // Clear Snivel
    if (effect instanceof EndTurnEffect && effect.player.marker.hasMarker(this.CLEAR_SNIVEL_MARKER, this)) {

      effect.player.marker.removeMarker(this.CLEAR_SNIVEL_MARKER, this);
      effect.player.forEachPokemon(PlayerType.TOP_PLAYER, (cardList) => {
        cardList.marker.removeMarker(this.SNIVEL_MARKER, this);
      });

      const opponent = StateUtils.getOpponent(state, effect.player);
      opponent.forEachPokemon(PlayerType.TOP_PLAYER, (cardList) => {
        cardList.marker.removeMarker(this.SNIVEL_MARKER, this);
      });
    }

    return state;
  }
}
