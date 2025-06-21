import { StoreLike, State, Power, PowerType, StateUtils } from '../../../game';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, SpecialCondition } from '../../../game/store/card/card-types';
import { Effect } from '../../../game/store/effects/effect';
import { AddSpecialConditionsEffect } from '../../../game/store/effects/attack-effects';
import { PlayPokemonEffect } from '../../../game/store/effects/play-card-effects';

export class Omanyte extends PokemonCard {

  public id: number = 52;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Mysterious Fossil';

  public cardTypes: CardType[] = [CardType.WATER];

  public hp: number = 40;

  public weakness = [{ type: CardType.LIGHTNING }];

  public retreat = [CardType.COLORLESS];

  public powers: Power[] = [{
    name: 'Clairvoyance',
    powerType: PowerType.POKEMON_POWER,
    text:
      'Your opponent plays with his or her hand face up. ' +
      'This power stops working while Omanyte is Asleep, Confused, or Paralyzed.'
  }]
  public attacks = [{
    name: 'Water Gun',
    cost: [CardType.WATER],
    damage: 10,
    text:
      'Does 10 damage plus 10 more damage for each {W} Energy attached to Omanyte ' +
      'but not used to pay for this attack\'s Energy cost. ' +
      'You can\'t add more than 20 damage in this way.'
  }];

  public set: string = 'FO';

  public name: string = 'Omanyte';

  public fullName: string = 'Omanyte FO';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Clairvoyance
    if (effect instanceof PlayPokemonEffect && effect.target.getPokemonCard() === this) {
      const opponent = StateUtils.getOpponent(state, effect.player);

      opponent.hand.isSecret = false;
      opponent.hand.isPublic = true;
    }

    if (effect instanceof AddSpecialConditionsEffect && effect.target.getPokemonCard() === this) {
      const opponent = StateUtils.getOpponent(state, effect.player);

      if (effect.specialConditions.some(sc => [SpecialCondition.ASLEEP, SpecialCondition.CONFUSED, SpecialCondition.PARALYZED].includes(sc))) {
        opponent.hand.isSecret = false;
        opponent.hand.isPublic = true;
      }
    }

    return state;
  }

}
