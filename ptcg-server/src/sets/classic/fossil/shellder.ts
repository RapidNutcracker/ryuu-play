import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, SpecialCondition } from '../../../game/store/card/card-types';
import { StoreLike, State, GameMessage, CoinFlipPrompt, PlayerType, StateUtils } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AddSpecialConditionsEffect, AfterDamageEffect, PutDamageEffect } from '../../../game/store/effects/attack-effects';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { EndTurnEffect } from '../../../game/store/effects/game-phase-effects';

export class Shellder extends PokemonCard {

  public id: number = 54;

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.WATER];

  public hp: number = 30;

  public weakness = [{ type: CardType.LIGHTNING }];

  public retreat = [CardType.COLORLESS];

  public attacks = [{
    name: 'Supersonic',
    cost: [CardType.WATER],
    damage: 0,
    text:
      'Flip a coin. If heads, the Defending Pokémon is now Confused.'
  }, {
    name: 'Hide in Shell',
    cost: [CardType.WATER],
    damage: 0,
    text:
      ' Flip a coin. If heads, prevent all damage done to Shellder during your opponent\'s next turn. ' +
      '(Any other effects of attacks still happen.)'
  }];

  public set: string = 'FO';

  public name: string = 'Shellder';

  public fullName: string = 'Shellder FO';

  public readonly HIDE_IN_SHELL_MARKER = 'HIDE_IN_SHELL_MARKER';

  public readonly CLEAR_HIDE_IN_SHELL_MARKER = 'CLEAR_HIDE_IN_SHELL_MARKER';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Supersonic
    if (effect instanceof AfterDamageEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], result => {
        if (result === true) {
          const specialConditionEffect = new AddSpecialConditionsEffect(effect.attackEffect, [SpecialCondition.CONFUSED]);
          store.reduceEffect(state, specialConditionEffect);
        }
      });
    }

    // Hide in Shell
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      state = store.prompt(state, new CoinFlipPrompt(
        player.id,
        GameMessage.COIN_FLIP
      ), flipResult => {
        if (flipResult) {
          player.active.marker.addMarker(this.HIDE_IN_SHELL_MARKER, this);
          opponent.marker.addMarker(this.CLEAR_HIDE_IN_SHELL_MARKER, this);
        }
      });

      return state;
    }

    // Hide in Shell is active
    if (effect instanceof PutDamageEffect && effect.target.marker.hasMarker(this.HIDE_IN_SHELL_MARKER)) {
      effect.preventDefault = true;
      return state;
    }

    // Clear Hide in Shell
    if (effect instanceof EndTurnEffect && effect.player.marker.hasMarker(this.CLEAR_HIDE_IN_SHELL_MARKER, this)) {

      effect.player.marker.removeMarker(this.CLEAR_HIDE_IN_SHELL_MARKER, this);

      const opponent = StateUtils.getOpponent(state, effect.player);
      opponent.forEachPokemon(PlayerType.TOP_PLAYER, (cardList) => {
        cardList.marker.removeMarker(this.HIDE_IN_SHELL_MARKER, this);
      });
    }


    return state;
  }
}
