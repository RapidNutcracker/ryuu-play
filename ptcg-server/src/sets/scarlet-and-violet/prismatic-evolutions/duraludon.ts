import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike } from '../../../game/store/store-like';
import { State } from '../../../game/store/state/state';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { Power, Resistance } from '../../../game/store/card/pokemon-types';

export class Duraludon extends PokemonCard {

  public id: number = 69;

  public tags: string[] = [];

  public stage: Stage = Stage.BASIC

  public cardTypes: CardType[] = [CardType.METAL];

  public hp: number = 120;

  public weakness = [{ type: CardType.FIRE }];

  public resistance: Resistance[] = [{ type: CardType.GRASS, value: -30 }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public powers: Power[] = [];

  public attacks = [{
    name: 'Hammer In',
    cost: [CardType.COLORLESS],
    damage: 30,
    text:
      ''
  }, {
    name: 'Raging Hammer',
    cost: [CardType.METAL, CardType.METAL, CardType.COLORLESS],
    damage: 80,
    text: 'This attack does 10 more damage for each damage counter on this Pokémon.'
  }];

  public set: string = 'PRE';

  public name: string = 'Duraludon';

  public fullName: string = 'Duraludon PRE';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Raging Hammer
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      effect.damage += effect.player.active.damage;
      return state;
    }

    return state;
  }

}
