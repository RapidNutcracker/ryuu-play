import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType, SpecialCondition } from '../../game/store/card/card-types';
import { StoreLike, State, Resistance, Weakness } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AddSpecialConditionsEffect } from '../../game/store/effects/attack-effects';
import { AttackEffect } from '../../game/store/effects/game-effects';

export class Jigglypuff extends PokemonCard {

  public id: number = 54;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.COLORLESS;

  public hp: number = 50;

  public weakness: Weakness[] = [{ type: CardType.FIGHTING }];

  public resistance: Resistance[] = [{ type: CardType.PSYCHIC, value: -30 }];

  public retreat = [CardType.COLORLESS];

  public attacks = [{
    name: 'Lullaby',
    cost: [CardType.COLORLESS],
    damage: 0,
    text: 'The Defending Pokémon is now Asleep.'
  }, {
    name: 'Pound',
    cost: [CardType.COLORLESS, CardType.COLORLESS],
    damage: 20,
    text: ''
  }];

  public set: string = 'JU';

  public name: string = 'Jigglypuff';

  public fullName: string = 'Jigglypuff JU';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Lullaby
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const specialConditionEffect = new AddSpecialConditionsEffect(effect, [SpecialCondition.ASLEEP]);
      store.reduceEffect(state, specialConditionEffect);
    }

    return state;
  }

}
