import { Effect } from '../../../game/store/effects/effect';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Attack, Resistance, Weakness } from '../../../game/store/card/pokemon-types';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { GamePhase, State } from '../../../game/store/state/state';
import { StateUtils } from '../../../game/store/state-utils';
import { StoreLike } from '../../../game/store/store-like';
import { CoinFlipPrompt, GameMessage, PlayerType } from '../../../game';
import { EndTurnEffect } from '../../../game/store/effects/game-phase-effects';
import { AbstractAttackEffect } from '../../../game/store/effects/attack-effects';

export class Eevee extends PokemonCard {

  public id: number = 51;

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.COLORLESS];

  public hp: number = 50;

  public weakness: Weakness[] = [{ type: CardType.FIGHTING }];

  public resistance: Resistance[] = [{ type: CardType.PSYCHIC, value: -30 }];

  public retreat = [CardType.COLORLESS];

  public attacks: Attack[] = [{
    name: 'Tail Wag',
    cost: [CardType.COLORLESS],
    damage: 0,
    text:
      'Flip a coin. ' +
      'If heads, the Defending Pokémon can\'t attack Eevee during your opponent\'s next turn. ' +
      '(Benching either Pokémon ends this effect.)'
  }, {
    name: 'Quick Attack',
    cost: [CardType.COLORLESS, CardType.COLORLESS],
    damage: 10,
    text: 'Flip a coin. If heads, this attack does 10 damage plus 20 more damage; if tails, this attack does 10 damage.'
  },];

  public set: string = 'JU';

  public name: string = 'Eevee';

  public fullName: string = 'Eevee JU';

  public readonly TAIL_WAG_MARKER = 'TAIL_WAG_MARKER';

  public readonly CLEAR_TAIL_WAG_MARKER = 'CLEAR_TAIL_WAG_MARKER';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Tail Wag
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], result => {
        if (result === true) {
          player.active.marker.addMarker(this.TAIL_WAG_MARKER, this);
          opponent.active.marker.addMarker(this.TAIL_WAG_MARKER, this);
          opponent.marker.addMarker(this.CLEAR_TAIL_WAG_MARKER, this);
        }
      });
    }

    // Quick Attack
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;

      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], result => {
        if (result === true) {
          effect.damage += 10;
        }
      });
    }

    // Tail Wag is Active
    if (effect instanceof AbstractAttackEffect && effect.target.cards.includes(this)) {
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
        effect.source.marker.hasMarker(this.TAIL_WAG_MARKER, this) &&
        effect.target.marker.hasMarker(this.TAIL_WAG_MARKER, this)
      ) {
        effect.preventDefault = true;
      }

      return state;
    }

    // Clear Tail Wag
    if (effect instanceof EndTurnEffect && effect.player.marker.hasMarker(this.CLEAR_TAIL_WAG_MARKER, this)) {

      effect.player.marker.removeMarker(this.CLEAR_TAIL_WAG_MARKER, this);
      effect.player.forEachPokemon(PlayerType.TOP_PLAYER, (cardList) => {
        cardList.marker.removeMarker(this.TAIL_WAG_MARKER, this);
      });

      const opponent = StateUtils.getOpponent(state, effect.player);
      opponent.forEachPokemon(PlayerType.TOP_PLAYER, (cardList) => {
        cardList.marker.removeMarker(this.TAIL_WAG_MARKER, this);
      });
    }

    return state;
  }
}
