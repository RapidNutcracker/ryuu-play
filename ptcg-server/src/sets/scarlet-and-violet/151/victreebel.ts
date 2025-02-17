import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, Resistance, Weakness, Attack, Power } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { EndTurnEffect } from '../../../game/store/effects/game-phase-effects';

export class Victreebel extends PokemonCard {

  public id: number = 71;

  public stage: Stage = Stage.STAGE_2;

  public evolvesFrom: string = 'Weepinbell';

  public cardTypes: CardType[] = [CardType.GRASS];

  public hp: number = 150;

  public weakness: Weakness[] = [{ type: CardType.FIRE }];

  public resistance: Resistance[] = [];

  public retreat: CardType[] = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public powers: Power[] = [];

  public attacks: Attack[] = [{
    name: 'Spit Up',
    cost: [CardType.GRASS],
    damage: 50,
    text: ''
  }, {
    name: 'Slow-Acting Acid',
    cost: [CardType.GRASS, CardType.COLORLESS],
    damage: 120,
    text: 'At the end of your opponent\'s next turn, put 12 damage counters on the Defending Pokémon.'
  }];

  public set: string = 'MEW';

  public name: string = 'Victreebel';

  public fullName: string = 'Victreebel MEW';

  public readonly SLOW_ACTING_ACID_MARKER = 'SLOW_ACTING_ACID_MARKER';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Slow-Acting Acid
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const opponent = effect.opponent;

      opponent.active.marker.addMarker(this.SLOW_ACTING_ACID_MARKER, this);
    }

    // Apply and Clear Slow-Acting Acid
    if (effect instanceof EndTurnEffect && effect.player.active.marker.hasMarker(this.SLOW_ACTING_ACID_MARKER, this)) {
      effect.player.active.marker.removeMarker(this.SLOW_ACTING_ACID_MARKER, this);

      effect.player.active.damage += 120;
    }

    return state;
  }

}
