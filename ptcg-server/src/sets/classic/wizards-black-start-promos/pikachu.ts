import { Effect } from '../../../game/store/effects/effect';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Attack, Resistance, Weakness } from '../../../game/store/card/pokemon-types';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { Stage, CardType, SpecialCondition } from '../../../game/store/card/card-types';
import { GamePhase, State } from '../../../game/store/state/state';
import { StateUtils } from '../../../game/store/state-utils';
import { StoreLike } from '../../../game/store/store-like';
import { CoinFlipPrompt, GameMessage, PlayerType } from '../../../game';
import { EndTurnEffect } from '../../../game/store/effects/game-phase-effects';
import { AddSpecialConditionsEffect, PutDamageEffect } from '../../../game/store/effects/attack-effects';

export class Pikachu extends PokemonCard {

  public id: number = 1;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.LIGHTNING;

  public hp: number = 60;

  public weakness: Weakness[] = [{ type: CardType.FIGHTING }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS];

  public attacks: Attack[] = [{
    name: 'Growl',
    cost: [CardType.COLORLESS],
    damage: 0,
    text:
      'If the Defending Pokémon attacks Pikachu during your opponent\'s next turn, ' +
      'any damage done by the attack is reduced by 10 (after applying Weakness and Resistance). ' +
      '(Benching either Pokémon ends this effect.)'
  }, {
    name: 'Thundershock',
    cost: [CardType.LIGHTNING, CardType.LIGHTNING],
    damage: 20,
    text:
      'Flip a coin. If heads, the Defending Pokémon is now Paralyzed.'
  }];

  public set: string = 'WBSP';

  public name: string = 'Pikachu';

  public fullName: string = 'Pikachu WBSP';

  public readonly GROWL_MARKER = 'GROWL_MARKER';

  public readonly CLEAR_GROWL_MARKER = 'CLEAR_GROWL_MARKER';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Growl
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      player.active.marker.addMarker(this.GROWL_MARKER, this);
      opponent.active.marker.addMarker(this.GROWL_MARKER, this);
      opponent.marker.addMarker(this.CLEAR_GROWL_MARKER, this);

      return state;
    }

    // Thundershock
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;

      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], result => {
        if (result === true) {
          const specialConditionEffect = new AddSpecialConditionsEffect(effect, [SpecialCondition.PARALYZED]);
          store.reduceEffect(state, specialConditionEffect);
        }
      });
    }

    // Growl is Active
    if (effect instanceof PutDamageEffect && effect.target.cards.includes(this)) {
      if (
        !(effect.source.marker.hasMarker(this.GROWL_MARKER, this) &&
          effect.target.marker.hasMarker(this.GROWL_MARKER, this))
      ) {
        return state;
      }

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

      effect.damage = Math.max(effect.damage - 10, 0);
    }

    // Clear Growl
    if (effect instanceof EndTurnEffect && effect.player.marker.hasMarker(this.CLEAR_GROWL_MARKER, this)) {

      effect.player.marker.removeMarker(this.CLEAR_GROWL_MARKER, this);
      effect.player.forEachPokemon(PlayerType.TOP_PLAYER, (cardList) => {
        cardList.marker.removeMarker(this.GROWL_MARKER, this);
      });

      const opponent = StateUtils.getOpponent(state, effect.player);
      opponent.forEachPokemon(PlayerType.TOP_PLAYER, (cardList) => {
        cardList.marker.removeMarker(this.GROWL_MARKER, this);
      });
    }

    return state;
  }
}
