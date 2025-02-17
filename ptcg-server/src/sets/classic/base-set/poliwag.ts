import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, Resistance, Weakness } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { CheckProvidedEnergyEffect } from '../../../game/store/effects/check-effects';

export class Poliwag extends PokemonCard {

  public id: number = 59;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.WATER;

  public hp: number = 40;

  public weakness: Weakness[] = [{ type: CardType.GRASS }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: 'Water Gun',
      cost: [CardType.WATER, CardType.WATER],
      damage: 0,
      text:
        'Does 10 damage plus 10 more damage for each {W} Energy attached to Poliwag ' +
        'but not used to pay for this attack\'s Energy cost. ' +
        'Extra {W} Energy after the 2nd don\'t count.'
    }
  ];

  public set: string = 'BS';

  public name: string = 'Poliwag';

  public fullName: string = 'Poliwag BS';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Water Gun
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      const checkProvidedEnergyEffect = new CheckProvidedEnergyEffect(player);
      store.reduceEffect(state, checkProvidedEnergyEffect);

      let additionalWaterEnergyCount = 0;
      checkProvidedEnergyEffect.energyMap.forEach(em => {
        const attachedWaterEnergy = em.provides.filter(cardType => {
          return cardType === CardType.WATER;
        }).length;
        const requiredWaterEnergy = effect.attack.cost.filter(cardType =>
          cardType === CardType.WATER
        ).length;

        additionalWaterEnergyCount = Math.max(attachedWaterEnergy - requiredWaterEnergy, 0);
      });
      effect.damage += Math.min(additionalWaterEnergyCount, 2) * 10;
    }

    return state;
  }

}
