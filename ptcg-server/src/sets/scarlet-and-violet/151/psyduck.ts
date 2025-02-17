import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, Resistance, Weakness, StateUtils } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { EndTurnEffect } from '../../../game/store/effects/game-phase-effects';

export class Psyduck extends PokemonCard {

  public id: number = 54;

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.WATER];

  public hp: number = 70;

  public weakness: Weakness[] = [{ type: CardType.LIGHTNING }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS];

  public attacks = [{
    name: 'Overthink',
    cost: [CardType.COLORLESS],
    damage: 0,
    text: 'During your opponent\'s next turn, whenever they flip a coin, treat it as tails.'
  }, {
    name: 'Water Gun',
    cost: [CardType.WATER],
    damage: 10,
    text: ''
  }];

  public set: string = 'MEW';

  public name: string = 'Psyduck';

  public fullName: string = 'Psyduck MEW';

  public readonly OVERTHINK_MARKER = 'OVERTHINK_MARKER';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    // Overthink
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      opponent.marker.addMarker(this.OVERTHINK_MARKER, this);

      return state;
    }

    if (effect instanceof EndTurnEffect) {
      effect.player.marker.removeMarker(this.OVERTHINK_MARKER, this);
    }

    return state;
  }

}
