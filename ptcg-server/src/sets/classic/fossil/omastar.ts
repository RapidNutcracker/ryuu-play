import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, GameMessage, CoinFlipPrompt } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { CheckProvidedEnergyEffect } from '../../../game/store/effects/check-effects';

export class Omastar extends PokemonCard {

  public id: number = 40;

  public stage: Stage = Stage.STAGE_2;

  public evolvesFrom = 'Omanyte';

  public cardTypes: CardType[] = [CardType.WATER];

  public hp: number = 70;

  public weakness = [{ type: CardType.LIGHTNING }];

  public retreat = [CardType.COLORLESS];

  public attacks = [{
    name: 'Water Gun',
    cost: [CardType.WATER, CardType.COLORLESS],
    damage: 20,
    text:
      'Does 20 damage plus 10 more damage for each {W} Energy attached to Omastar ' +
      'but not used to pay for this attack\'s Energy cost. ' +
      'You can\'t add more than 20 damage in this way.'
  }, {
    name: 'Spike Cannon',
    cost: [CardType.WATER, CardType.WATER],
    damage: 30,
    text:
      'Flip 2 coins. This attack does 30 damage times the number of heads.'
  }];

  public set: string = 'FO';

  public name: string = 'Omastar';

  public fullName: string = 'Omastar FO';

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

    // Spike Cannon
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;
      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP),
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], results => {
        let heads: number = 0;
        results.forEach(r => { heads += r ? 1 : 0; });
        effect.damage = 30 * heads;
      });
    }

    return state;
  }
}
