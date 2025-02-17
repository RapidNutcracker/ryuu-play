import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, GameMessage, CoinFlipPrompt } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { CheckProvidedEnergyEffect } from '../../../game/store/effects/check-effects';

export class Vaporeon extends PokemonCard {

  public id: number = 12;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Eevee';

  public cardType: CardType = CardType.WATER;

  public hp: number = 80;

  public weakness = [{ type: CardType.LIGHTNING }];

  public retreat = [CardType.COLORLESS];

  public attacks = [{
    name: 'Quick Attack',
    cost: [CardType.COLORLESS, CardType.COLORLESS],
    damage: 10,
    text: 'Flip a coin. If heads, this attack does 10 damage plus 20 more damage; if tails, this attack does 10 damage.'
  }, {
    name: 'Water Gun',
    cost: [CardType.WATER, CardType.WATER, CardType.COLORLESS],
    damage: 30,
    text:
      'Does 30 damage plus 10 more damage for each {W} Energy attached to Vaporeon ' +
      'but not used to pay for this attack\'s Energy cost. Extra {W} Energy after the 2nd doesn\'t count.'
  }];

  public set: string = 'JU';

  public name: string = 'Vaporeon';

  public fullName: string = 'Vaporeon JU';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    // Quick Attack
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], result => {
        if (result === true) {
          effect.damage += 10;
        }
      });
    }

    // Water Gun
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;

      const checkProvidedEnergyEffect = new CheckProvidedEnergyEffect(player);
      state = store.reduceEffect(state, checkProvidedEnergyEffect);

      let additionalWaterEnergyCount = 0;
      const attachedWaterEnergy = checkProvidedEnergyEffect.energyMap.reduce(
        (left, p) => left + p.provides.filter(cardType => cardType == CardType.WATER).length, 0);

      additionalWaterEnergyCount = Math.max(attachedWaterEnergy - 3, 0);

      effect.damage += Math.min(additionalWaterEnergyCount, 2) * 10;
    }

    return state;
  }
}
