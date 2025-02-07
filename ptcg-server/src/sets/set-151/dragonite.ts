import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';
import { StoreLike, State, Power, PowerType, PlayerType } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect, PowerEffect } from '../../game/store/effects/game-effects';
import { CheckRetreatCostEffect } from '../../game/store/effects/check-effects';

export class Dragonite extends PokemonCard {

  public id: number = 149;

  public stage: Stage = Stage.STAGE_2;

  public evolvesFrom: string = 'Dragonair';

  public cardType: CardType = CardType.DRAGON;

  public hp: number = 180;

  public retreat = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public powers: Power[] = [{
    name: 'Jet Cruise',
    powerType: PowerType.ABILITY,
    text: 'Your Pokémon in play have no Retreat Cost.'
  }];

  public attacks = [{
    name: 'Dragon Pulse',
    cost: [CardType.WATER, CardType.LIGHTNING],
    damage: 90,
    text: 'Discard the top 2 cards of your deck.'
  }];

  public set: string = 'MEW';

  public name: string = 'Dragonite';

  public fullName: string = 'Dragonite MEW';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Jet Cruise
    if (effect instanceof CheckRetreatCostEffect) {
      const player = effect.player;

      let hasDragoniteInPlay = false;
      player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (cardList, card) => {
        if (card === this) {
          hasDragoniteInPlay = true;
        }
      });

      if (!hasDragoniteInPlay) {
        return state;
      }

      // Try to reduce PowerEffect, to check if something is blocking our ability
      try {
        const powerEffect = new PowerEffect(player, this.powers[0], this);
        store.reduceEffect(state, powerEffect);
      } catch {
        return state;
      }

      effect.cost = [];

      return state;
    }

    // Dragon Pulse
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      player.deck.moveTo(player.discard, 2);
      return state;
    }

    return state;
  }
}