import { AttackEffect } from '../../../game/store/effects/game-effects';
import { Effect } from '../../../game/store/effects/effect';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State } from '../../../game';

export class Pinsir extends PokemonCard {

  public id: number = 127;

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.GRASS];

  public hp: number = 120;

  public weakness = [{ type: CardType.FIRE }];

  public resistance = [];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public powers = [];

  public attacks = [{
    name: 'Vice Grip',
    cost: [CardType.GRASS, CardType.COLORLESS],
    damage: 30,
    text: ''
  }, {
    name: 'Reckless Throw',
    cost: [CardType.GRASS, CardType.GRASS, CardType.COLORLESS],
    damage: 90,
    text: 'If you have more Prize cards remaining than your opponent, this attack does 90 more damage.'
  }];

  public set: string = 'MEW';

  public name: string = 'Pinsir';

  public fullName: string = 'Pinsir MEW';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Reckless Throw
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = effect.opponent;

      if (player.prizes.length > opponent.prizes.length) {
        effect.damage += 90;
      }
    }

    return state;
  }
}
