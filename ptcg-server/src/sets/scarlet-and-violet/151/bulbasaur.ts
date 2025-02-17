import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, Resistance, Weakness } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { HealTargetEffect } from '../../../game/store/effects/attack-effects';

export class Bulbasaur extends PokemonCard {

  public id: number = 1;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.GRASS;

  public hp: number = 70;

  public weakness: Weakness[] = [{ type: CardType.FIRE }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: 'Leech Seed',
      cost: [CardType.GRASS, CardType.COLORLESS],
      damage: 20,
      text: 'Heal 20 damage from this Pokémon.'
    }
  ];

  public set: string = 'MEW';

  public name: string = 'Bulbasaur';

  public fullName: string = 'Bulbasaur MEW';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Leech Seed
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      if (effect.damage > 0) {
        const healEffect = new HealTargetEffect(effect, 20);
        healEffect.target = player.active;
        return store.reduceEffect(state, healEffect);
      }
    }

    return state;
  }

}
