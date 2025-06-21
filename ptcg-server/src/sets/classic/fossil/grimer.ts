import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, SpecialCondition } from '../../../game/store/card/card-types';
import { StoreLike, State, GameMessage, CoinFlipPrompt, PlayerType, StateUtils } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AddSpecialConditionsEffect, AfterDamageEffect, PutDamageEffect } from '../../../game/store/effects/attack-effects';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { EndTurnEffect } from '../../../game/store/effects/game-phase-effects';

export class Grimer extends PokemonCard {

  public id: number = 48;

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.GRASS];

  public hp: number = 50;

  public weakness = [{ type: CardType.PSYCHIC }];

  public retreat = [CardType.COLORLESS];

  public attacks = [{
    name: 'Nasty Goo',
    cost: [CardType.COLORLESS],
    damage: 10,
    text:
      'Flip a coin. If heads, the Defending Pokémon is now Paralyzed.'
  }, {
    name: 'Minimize',
    cost: [CardType.GRASS],
    damage: 0,
    text:
      'All damage done by attacks to Grimer during your opponent\'s next turn ' +
      'is reduced by 20 (after applying Weakness and Resistance).'
  }];

  public set: string = 'FO';

  public name: string = 'Grimer';

  public fullName: string = 'Grimer FO';

  public readonly MINIMIZE_MARKER = 'MINIMIZE_MARKER';

  public readonly CLEAR_MINIMIZE_MARKER = 'CLEAR_MINIMIZE_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Nasty Goo
    if (effect instanceof AfterDamageEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], result => {
        if (result === true) {
          const specialConditionEffect = new AddSpecialConditionsEffect(effect.attackEffect, [SpecialCondition.PARALYZED]);
          store.reduceEffect(state, specialConditionEffect);
        }
      });
    }

    // Minimize
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      state = store.prompt(state, new CoinFlipPrompt(
        player.id,
        GameMessage.COIN_FLIP
      ), flipResult => {
        if (flipResult) {
          player.active.marker.addMarker(this.MINIMIZE_MARKER, this);
          opponent.marker.addMarker(this.CLEAR_MINIMIZE_MARKER, this);
        }
      });

      return state;
    }

    if (effect instanceof PutDamageEffect && effect.target.marker.hasMarker(this.MINIMIZE_MARKER)) {
      effect.damage -= 20;
      return state;
    }

    if (effect instanceof EndTurnEffect && effect.player.marker.hasMarker(this.CLEAR_MINIMIZE_MARKER, this)) {

      effect.player.marker.removeMarker(this.CLEAR_MINIMIZE_MARKER, this);

      const opponent = StateUtils.getOpponent(state, effect.player);
      opponent.forEachPokemon(PlayerType.TOP_PLAYER, (cardList) => {
        cardList.marker.removeMarker(this.MINIMIZE_MARKER, this);
      });
    }
    
    return state;
  }
}
