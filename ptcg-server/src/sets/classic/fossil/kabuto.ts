import { StoreLike, State, Power, PowerType } from '../../../game';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, SpecialCondition } from '../../../game/store/card/card-types';
import { Effect } from '../../../game/store/effects/effect';
import { PowerEffect } from '../../../game/store/effects/game-effects';
import { PutDamageEffect } from '../../../game/store/effects/attack-effects';

export class Kabuto extends PokemonCard {

  public id: number = 50;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Mysterious Fossil';

  public cardTypes: CardType[] = [CardType.FIGHTING];

  public hp: number = 30;

  public weakness = [{ type: CardType.GRASS }];

  public retreat = [CardType.COLORLESS];

  public powers: Power[] = [{
    name: 'Kabuto Armor',
    powerType: PowerType.POKEMON_POWER,
    text:
      'Whenever an attack (even your own) does damage to Kabuto ' +
      '(after applying Weakness and Resistance), ' +
      'that attack does half the damage to Kabuto ' +
      '(rounded down to the nearest 10). ' +
      '(Any other effects of attacks still happen.) ' +
      'This power stops working while Kabuto is Asleep, Confused, or Paralyzed.'
  }]
  public attacks = [{
    name: 'Scratch',
    cost: [CardType.COLORLESS],
    damage: 10,
    text: ''
  }];

  public set: string = 'FO';

  public name: string = 'Kabuto';

  public fullName: string = 'Kabuto FO';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Kabuto Armor
    if (effect instanceof PutDamageEffect && effect.target.getPokemonCard() === this) {

      const kabutoIsAsleepConfusedParalyzed = [
        SpecialCondition.ASLEEP,
        SpecialCondition.CONFUSED,
        SpecialCondition.PARALYZED
      ].some(sc =>
        effect.target.specialConditions.includes(sc));

      if (kabutoIsAsleepConfusedParalyzed) {
        return state;
      }

      try {
        const powerEffect = new PowerEffect(effect.player, this.powers[0], this);
        store.reduceEffect(state, powerEffect);
      } catch {
        return state;
      }

      effect.damage = Math.floor((effect.damage / 2) / 10) * 10;
    }

    return state;
  }

}
