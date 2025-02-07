import { Effect } from '../../game/store/effects/effect';
import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Attack, Power, Resistance, Weakness } from '../../game/store/card/pokemon-types';
import { AttackEffect } from '../../game/store/effects/game-effects';
import { Stage, CardType } from '../../game/store/card/card-types';
import { State } from '../../game/store/state/state';
import { StoreLike } from '../../game/store/store-like';
import { EndTurnEffect } from '../../game/store/effects/game-phase-effects';
import { CheckRetreatCostEffect } from '../../game/store/effects/check-effects';

export class Grimer extends PokemonCard {

  public id: number = 88;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.DARK;

  public hp: number = 80;

  public weakness: Weakness[] = [{ type: CardType.FIGHTING }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public powers: Power[] = [];

  public attacks: Attack[] = [{
    name: 'Gummy Press',
    cost: [CardType.DARK],
    damage: 10,
    text: 'During your opponent\'s next turn, the Defending Pokémon\'s Retreat Cost is {C} more.'
  }];

  public set: string = 'MEW';

  public name: string = 'Grimer';

  public fullName: string = 'Grimer MEW';

  public readonly GUMMY_PRESS_MARKER = 'GUMMY_PRESS_MARKER';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Gummy Press
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const opponent = effect.opponent;

      opponent.active.marker.addMarker(this.GUMMY_PRESS_MARKER, this);
    }

    // Gummy Press Active
    if (effect instanceof CheckRetreatCostEffect && effect.player.active.marker.hasMarker(this.GUMMY_PRESS_MARKER, this)) {
      effect.cost.push(CardType.COLORLESS);
    }

    // Clear Gummy Press
    if (effect instanceof EndTurnEffect && effect.player.active.marker.hasMarker(this.GUMMY_PRESS_MARKER, this)) {
      effect.player.active.marker.removeMarker(this.GUMMY_PRESS_MARKER, this);
    }

    return state;
  }

}
