import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, Resistance, Weakness } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { PutDamageEffect } from '../../../game/store/effects/attack-effects';

export class Dugtrio extends PokemonCard {

  public id: number = 19;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Diglett';

  public cardTypes: CardType[] = [CardType.FIGHTING];

  public hp: number = 70;

  public weakness: Weakness[] = [{ type: CardType.GRASS }];

  public resistance: Resistance[] = [{ type: CardType.LIGHTNING, value: -30 }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: 'Slash',
      cost: [CardType.FIGHTING, CardType.FIGHTING, CardType.COLORLESS],
      damage: 40,
      text: ''
    },
    {
      name: 'Earthquake',
      cost: [CardType.FIGHTING, CardType.FIGHTING, CardType.FIGHTING, CardType.FIGHTING],
      damage: 70,
      text: 'Does 10 damage to each of your own Benched Pokémon. (Don\'t apply Weakness and Resistance for Benched Pokémon.)'
    }
  ];

  public set: string = 'BS';

  public name: string = 'Dugtrio';

  public fullName: string = 'Dugtrio BS';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Earthquake
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;

      const benched = player.bench.filter(b => b.cards.length > 0);

      benched.forEach(target => {
        const damageEffect = new PutDamageEffect(effect, 20);
        damageEffect.target = target;
        store.reduceEffect(state, damageEffect);
      });
    }

    return state;
  }

}
