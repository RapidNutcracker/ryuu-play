import { AttackEffect, PowerEffect } from '../../../game/store/effects/game-effects';
import { Effect } from '../../../game/store/effects/effect';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Power, PowerType, Resistance, Weakness } from '../../../game/store/card/pokemon-types';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { State } from '../../../game/store/state/state';
import { StoreLike } from '../../../game/store/store-like';
import { StateUtils } from '../../../game';
import { PutDamageEffect } from '../../../game/store/effects/attack-effects';
import { CheckProvidedEnergyEffect, CheckRetreatCostEffect } from '../../../game/store/effects/check-effects';

export class Articuno extends PokemonCard {

  public id: number = 144;

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.WATER];

  public hp: number = 120;

  public weakness: Weakness[] = [{ type: CardType.LIGHTNING }];

  public resistance: Resistance[] = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public powers: Power[] = [{
    name: 'Ice Float',
    powerType: PowerType.ABILITY,
    text: 'If this Pokémon has any {W} Energy attached, it has no Retreat Cost.'
  }];

  public attacks = [{
    name: 'Blizzard',
    cost: [CardType.WATER, CardType.WATER, CardType.WATER],
    damage: 110,
    text:
      'This attack also does 10 damage to each of your opponent\'s Benched Pokémon. ' +
      '(Don\'t apply Weakness and Resistance for Benched Pokémon.)'
  }];

  public set: string = 'MEW';

  public name: string = 'Articuno';

  public fullName: string = 'Articuno MEW';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Ice Float
    if (effect instanceof CheckRetreatCostEffect) {
      const player = effect.player;

      const isArticunoActive = player.active.getPokemonCard() === this;

      if (!isArticunoActive) {
        return state;
      }

      const checkProvidedEnergyEffect = new CheckProvidedEnergyEffect(player, player.active);
      store.reduceEffect(state, checkProvidedEnergyEffect);

      const energyMap = checkProvidedEnergyEffect.energyMap;
      const hasWaterEnergyAttached = StateUtils.checkEnoughEnergy(energyMap, [CardType.WATER]);

      if (hasWaterEnergyAttached) {
        // Try to reduce PowerEffect, to check if something is blocking our ability
        try {
          const powerEffect = new PowerEffect(player, this.powers[0], this);
          store.reduceEffect(state, powerEffect);
        } catch {
          return state;
        }

        effect.cost = [];
      }

      return state;
    }

    // Blizzard
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const opponent = effect.opponent;
      const benched = opponent.bench.filter(b => b.cards.length > 0);

      benched.forEach(target => {
        const damageEffect = new PutDamageEffect(effect, 10);
        damageEffect.target = target;
        store.reduceEffect(state, damageEffect);
      });
    }

    return state;
  }
}
