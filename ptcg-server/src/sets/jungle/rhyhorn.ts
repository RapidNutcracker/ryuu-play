import { Effect } from '../../game/store/effects/effect';
import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Attack, Resistance, Weakness } from '../../game/store/card/pokemon-types';
import { AttackEffect } from '../../game/store/effects/game-effects';
import { Stage, CardType } from '../../game/store/card/card-types';
import { GamePhase, State } from '../../game/store/state/state';
import { StateUtils } from '../../game/store/state-utils';
import { StoreLike } from '../../game/store/store-like';
import { CoinFlipPrompt, GameMessage, PlayerType } from '../../game';
import { EndTurnEffect } from '../../game/store/effects/game-phase-effects';
import { AbstractAttackEffect } from '../../game/store/effects/attack-effects';

export class Rhyhorn extends PokemonCard {

  public id: number = 61;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.FIGHTING;

  public hp: number = 70;

  public weakness: Weakness[] = [{ type: CardType.GRASS }];

  public resistance: Resistance[] = [{ type: CardType.LIGHTNING, value: -30 }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public attacks: Attack[] = [{
    name: 'Leer',
    cost: [CardType.COLORLESS],
    damage: 0,
    text:
      'Flip a coin. ' +
      'If heads, the Defending Pokémon can\'t attack Rhyhorn during your opponent\'s next turn. ' +
      '(Benching either Pokémon ends this effect.)'
  }, {
    name: 'Horn Attack',
    cost: [CardType.FIGHTING, CardType.COLORLESS, CardType.COLORLESS],
    damage: 10,
    text: ''
  },];

  public set: string = 'JU';

  public name: string = 'Rhyhorn';

  public fullName: string = 'Rhyhorn JU';

  public readonly LEER_MARKER = 'LEER_MARKER';

  public readonly CLEAR_LEER_MARKER = 'CLEAR_LEER_MARKER';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Leer
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], result => {
        if (result === true) {
          player.active.marker.addMarker(this.LEER_MARKER, this);
          opponent.active.marker.addMarker(this.LEER_MARKER, this);
          opponent.marker.addMarker(this.CLEAR_LEER_MARKER, this);
        }
      });
    }

    // Leer is Active
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
        effect.source.marker.hasMarker(this.LEER_MARKER, this) &&
        effect.target.marker.hasMarker(this.LEER_MARKER, this)
      ) {
        effect.preventDefault = true;
      }

      return state;
    }

    // Clear Leer
    if (effect instanceof EndTurnEffect && effect.player.marker.hasMarker(this.CLEAR_LEER_MARKER, this)) {

      effect.player.marker.removeMarker(this.CLEAR_LEER_MARKER, this);
      effect.player.forEachPokemon(PlayerType.TOP_PLAYER, (cardList) => {
        cardList.marker.removeMarker(this.LEER_MARKER, this);
      });

      const opponent = StateUtils.getOpponent(state, effect.player);
      opponent.forEachPokemon(PlayerType.TOP_PLAYER, (cardList) => {
        cardList.marker.removeMarker(this.LEER_MARKER, this);
      });
    }

    return state;
  }
}
