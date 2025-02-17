import { StoreLike, State, StateUtils, CoinFlipPrompt } from '../../../game';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { GameMessage } from '../../../game/game-message';
import { PutDamageEffect } from '../../../game/store/effects/attack-effects';
import { EndTurnEffect } from '../../../game/store/effects/game-phase-effects';

export class Electabuzz extends PokemonCard {

  public id: number = 2;

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.PSYCHIC];

  public hp: number = 70;

  public weakness = [{ type: CardType.PSYCHIC }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [{
    name: 'Light Screen',
    cost: [CardType.LIGHTNING],
    damage: 0,
    text:
      'Whenever an attack does damage to Electabuzz (after applying Weakness and Resistance) ' +
      'during your opponent\'s next turn, that attack only does half the damage to Electabuzz ' +
      '(rounded down to the nearest 10). (Any other effects of attacks still happen.)'
  }, {
    name: 'Quick Attack',
    cost: [CardType.COLORLESS, CardType.COLORLESS],
    damage: 10,
    text:
      'Flip a coin. ' +
      'If heads, this attack does 10 damage plus 20 more damage; ' +
      'if tails, this attack does 10 damage.'
  }];

  public set: string = 'WBSP';

  public name: string = 'Electabuzz';

  public fullName: string = 'Electabuzz WBSP';

  private readonly LIGHT_SCREEN_MARKER = 'LIGHT_SCREEN_MARKER';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Light Screen
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      opponent.marker.addMarker(this.LIGHT_SCREEN_MARKER, this);
    }

    // Quick Attack
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;

      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], result => {
        if (result === true) {
          effect.damage += 20;
        }
      });
    }

    // Light Screen is active
    if (effect instanceof PutDamageEffect && effect.player.marker.hasMarker(this.LIGHT_SCREEN_MARKER, this)) {
      effect.damage = Math.floor((effect.damage / 2) / 10) * 10;
    }

    // Clear Light Screen
    if (effect instanceof EndTurnEffect && effect.player.marker.hasMarker(this.LIGHT_SCREEN_MARKER, this)) {
      effect.player.marker.removeMarker(this.LIGHT_SCREEN_MARKER, this);
    }

    return state;
  }

}
