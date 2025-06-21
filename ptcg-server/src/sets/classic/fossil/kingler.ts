import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';

export class Kingler extends PokemonCard {

  public id: number = 38;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom = 'Krabby';

  public cardTypes: CardType[] = [CardType.WATER];

  public hp: number = 60;

  public weakness = [{ type: CardType.LIGHTNING }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [{
    name: 'Flail',
    cost: [CardType.WATER],
    damage: 10,
    text:
      'Does 10 damage times the number of damage counters on Kingler.'
  }, {
    name: 'Crab Hammer',
    cost: [CardType.WATER, CardType.WATER, CardType.COLORLESS],
    damage: 40,
    text: ''
  }];

  public set: string = 'FO';

  public name: string = 'Kingler';

  public fullName: string = 'Kingler FO';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Flail
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      effect.damage *= effect.player.active.damage;
      return state;
    }

    return state;
  }
}
