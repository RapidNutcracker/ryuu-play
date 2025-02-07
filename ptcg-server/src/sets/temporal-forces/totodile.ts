import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';
import { StoreLike, State, Resistance, Weakness, Attack, Power, GameError } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect, RetreatEffect } from '../../game/store/effects/game-effects';
import { GameMessage } from '../../game/game-message';
import { EndTurnEffect } from '../../game/store/effects/game-phase-effects';

export class Totodile extends PokemonCard {

  public id: number = 39;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.WATER;

  public hp: number = 70;

  public weakness: Weakness[] = [{ type: CardType.LIGHTNING }];

  public resistance: Resistance[] = [];

  public retreat: CardType[] = [CardType.COLORLESS];

  public powers: Power[] = [];

  public attacks: Attack[] = [{
    name: 'Big Bite',
    cost: [CardType.WATER],
    damage: 10,
    text: 'During your opponent\'s next turn, the Defending Pokémon can\'t retreat.'
  }];

  public set: string = 'TEF';

  public name: string = 'Totodile';

  public fullName: string = 'Totodile TEF';

  public readonly BIG_BITE_MARKER = 'BIG_BITE_MARKER';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Big Bite
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const opponent = effect.opponent;

      opponent.active.marker.addMarker(this.BIG_BITE_MARKER, this);
    }

    // Big Bite Active
    if (effect instanceof RetreatEffect && effect.player.active.marker.hasMarker(this.BIG_BITE_MARKER, this)) {
      effect.preventDefault = true;
      throw new GameError(GameMessage.BLOCKED_BY_EFFECT);
    }

    // Clear Big Bite
    if (effect instanceof EndTurnEffect && effect.player.active.marker.hasMarker(this.BIG_BITE_MARKER, this)) {
      effect.player.active.marker.removeMarker(this.BIG_BITE_MARKER, this);
    }

    return state;
  }

}
