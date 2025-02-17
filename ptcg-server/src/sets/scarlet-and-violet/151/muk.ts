import { Effect } from '../../../game/store/effects/effect';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Attack, Power, Resistance, Weakness } from '../../../game/store/card/pokemon-types';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { State } from '../../../game/store/state/state';
import { StoreLike } from '../../../game/store/store-like';
import { EndTurnEffect } from '../../../game/store/effects/game-phase-effects';
import { CheckAttackCostEffect, CheckRetreatCostEffect } from '../../../game/store/effects/check-effects';

export class Muk extends PokemonCard {

  public id: number = 89;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Grimer';

  public cardTypes: CardType[] = [CardType.DARKNESS];

  public hp: number = 150;

  public weakness: Weakness[] = [{ type: CardType.FIGHTING }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public powers: Power[] = [];

  public attacks: Attack[] = [{
    name: 'Sticky Jail',
    cost: [CardType.DARKNESS],
    damage: 30,
    text:
      'During your opponent\'s next turn, attacks used by the ' +
      'Defending Pokémon cost {C} more, and its Retreat Cost is {C} more.'
  }, {
    name: 'Sludge Bomb',
    cost: [CardType.DARKNESS, CardType.DARKNESS, CardType.DARKNESS, CardType.COLORLESS],
    damage: 180,
    text: ''
  }];

  public set: string = 'MEW';

  public name: string = 'Muk';

  public fullName: string = 'Muk MEW';

  public readonly STICKY_JAIL_MARKER = 'STICKY_JAIL_MARKER';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Sticky Jail
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const opponent = effect.opponent;

      opponent.active.marker.addMarker(this.STICKY_JAIL_MARKER, this);
    }

    // Sticky Jail Active (Active)
    if ((effect instanceof CheckRetreatCostEffect || effect instanceof CheckAttackCostEffect)) {
      if (effect.player.active.marker.hasMarker(this.STICKY_JAIL_MARKER, this)) {
        effect.cost.push(CardType.COLORLESS);
      }
    }

    // Clear Sticky Jail
    if (effect instanceof EndTurnEffect && effect.player.active.marker.hasMarker(this.STICKY_JAIL_MARKER, this)) {
      effect.player.active.marker.removeMarker(this.STICKY_JAIL_MARKER, this);
    }

    return state;
  }

}
