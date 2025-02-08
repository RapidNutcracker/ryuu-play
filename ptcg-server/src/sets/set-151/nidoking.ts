import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType, SpecialCondition } from '../../game/store/card/card-types';
import { StoreLike, State, Power, PowerType } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect } from '../../game/store/effects/game-effects';
import { AddSpecialConditionsEffect } from '../../game/store/effects/attack-effects';
import { CheckAttackCostEffect } from '../../game/store/effects/check-effects';

export class Nidoking extends PokemonCard {

  public id: number = 34;

  public stage: Stage = Stage.STAGE_2;

  public evolvesFrom: string = 'Nidorino';

  public cardType: CardType = CardType.DARK;

  public hp: number = 170;

  public weakness = [{ type: CardType.FIGHTING }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public powers: Power[] = [{
    name: 'Enthusiastic King',
    powerType: PowerType.ABILITY,
    text: 'If you have Nidoqueen in play, ignore all Energy in the costs of attacks used by this Pokémon.'
  }];

  public attacks = [{
    name: 'Venomous Impact',
    cost: [CardType.DARK, CardType.DARK, CardType.COLORLESS, CardType.COLORLESS],
    damage: 190,
    text: 'Your opponent\'s Active Pokémon is now Poisoned.'
  }];

  public set: string = 'MEW';

  public name: string = 'Nidoking';

  public fullName: string = 'Nidoking MEW';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Enthusiastic King
    if (effect instanceof CheckAttackCostEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      let isNidoqueenInPlay = player.bench.some(benchSlot =>
        benchSlot.cards.length > 0 && benchSlot.getPokemonCard()?.name === 'Nidoqueen'
      );

      if (!isNidoqueenInPlay) {
        return state;
      }

      effect.cost = [];
    }

    // Venomous Impact
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const specialCondition = new AddSpecialConditionsEffect(effect, [SpecialCondition.POISONED]);
      return store.reduceEffect(state, specialCondition);
    }

    return state;
  }

}
