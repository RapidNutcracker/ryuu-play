import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, SpecialCondition } from '../../../game/store/card/card-types';
import { StoreLike, State, GameMessage, CoinFlipPrompt } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { CheckProvidedEnergyEffect } from '../../../game/store/effects/check-effects';
import { AddSpecialConditionsEffect } from '../../../game/store/effects/attack-effects';

export class Lapras extends PokemonCard {

  public id: number = 10;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.WATER;

  public hp: number = 80;

  public weakness = [{ type: CardType.LIGHTNING }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [{
    name: 'Water Gun',
    cost: [CardType.WATER],
    damage: 30,
    text:
      'Does 30 damage plus 10 more damage for each {W} Energy attached to Lapras ' +
      'but not used to pay for this attack\'s Energy cost. Extra {W} Energy after the 2nd doesn\'t count.'
  }, {
    name: 'Confuse Ray',
    cost: [CardType.WATER, CardType.WATER],
    damage: 10,
    text: 'Flip a coin. If heads, the Defending Pokémon is now Confused.'
  }];

  public set: string = 'FO';

  public name: string = 'Lapras';

  public fullName: string = 'Lapras FO';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    // Water Gun
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      const checkProvidedEnergyEffect = new CheckProvidedEnergyEffect(player);
      state = store.reduceEffect(state, checkProvidedEnergyEffect);

      let additionalWaterEnergyCount = 0;
      const attachedWaterEnergy = checkProvidedEnergyEffect.energyMap.reduce(
        (left, p) => left + p.provides.filter(cardType => cardType == CardType.WATER).length, 0);

      additionalWaterEnergyCount = Math.max(attachedWaterEnergy - 3, 0);

      effect.damage += Math.min(additionalWaterEnergyCount, 2) * 10;
    }


    // Confuse Ray
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;

      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], result => {
        if (result === true) {
          const specialConditionEffect = new AddSpecialConditionsEffect(effect, [SpecialCondition.CONFUSED]);
          store.reduceEffect(state, specialConditionEffect);
        }
      });
    }

    return state;
  }
}
