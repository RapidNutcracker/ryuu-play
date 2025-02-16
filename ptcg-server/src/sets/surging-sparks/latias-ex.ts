import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType, CardTag } from '../../game/store/card/card-types';
import { StoreLike } from '../../game/store/store-like';
import { State } from '../../game/store/state/state';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect, PowerEffect, UseAttackEffect } from '../../game/store/effects/game-effects';
import { Attack, Power, PowerType, Resistance } from '../../game/store/card/pokemon-types';
import { GameMessage } from '../../game/game-message';
import { GameError, PlayerType } from '../../game';
import { CheckRetreatCostEffect } from '../../game/store/effects/check-effects';

export class LatiasEx extends PokemonCard {

  public id: number = 76;

  public tags: string[] = [CardTag.EX];

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.PSYCHIC;

  public hp: number = 210;

  public weakness = [{ type: CardType.DARKNESS }];

  public resistance: Resistance[] = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public powers: Power[] = [{
    name: 'Skyliner',
    powerType: PowerType.ABILITY,
    text:
      'Your Basic Pokémon in play have no Retreat Cost.'
  }];

  public attacks: Attack[] = [{
    name: 'Eon Blade',
    cost: [CardType.PSYCHIC, CardType.PSYCHIC, CardType.COLORLESS],
    damage: 200,
    text: 'During your next turn, this Pokémon can\'t attack.'
  }];

  public set: string = 'SSP';

  public name: string = 'Latias ex';

  public fullName: string = 'Latias ex SSP';

  private eonBladeUsedTurn: number = -1;


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Skyliner
    if (effect instanceof CheckRetreatCostEffect) {
      const player = effect.player;

      let hasLatiasExInPlay = false;
      player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (cardList, card) => {
        if (card === this) {
          hasLatiasExInPlay = true;
        }
      });

      if (!hasLatiasExInPlay) {
        return state;
      }

      // Try to reduce PowerEffect, to check if something is blocking our ability
      try {
        const powerEffect = new PowerEffect(player, this.powers[0], this);
        store.reduceEffect(state, powerEffect);
      } catch {
        return state;
      }

      if (effect.player.active.isBasic()) {
        effect.cost = [];
      }

      return state;
    }

    // Photon Blaster
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      this.eonBladeUsedTurn = state.turn;
    }

    // Used Photon Blaster last turn
    if (effect instanceof UseAttackEffect && effect.card === this) {
      if (this.eonBladeUsedTurn === state.turn - 2) {
        throw new GameError(GameMessage.CANNOT_USE_ATTACK);
      }
    }

    return state;
  }

}
