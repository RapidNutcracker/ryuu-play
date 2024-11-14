import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';
import { StoreLike, State } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect } from '../../game/store/effects/game-effects';
import { DealDamageEffect } from '../../game/store/effects/attack-effects';

export class Machoke extends PokemonCard {

  public id: number = 33;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Machop';

  public cardType: CardType = CardType.FIGHTING;

  public hp: number = 80;

  public weakness = [{ type: CardType.PSYCHIC }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: 'Karate Chop',
      cost: [CardType.FIGHTING, CardType.FIGHTING, CardType.COLORLESS],
      damage: 50,
      text: 'Does 50 damage minus 10 damage for each damage counter on Machoke.'
    },
    {
      name: 'Submission',
      cost: [CardType.FIGHTING, CardType.FIGHTING, CardType.COLORLESS, CardType.COLORLESS],
      damage: 60,
      text: 'Machoke does 20 damage to itself.'
    }
  ];

  public set: string = 'BS';

  public name: string = 'Machoke';

  public fullName: string = 'Machoke BS';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Karate Chop
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      effect.damage = Math.max(effect.attack.damage - effect.player.active.damage, 0);
      return state;
    }

    // Submission
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;

      const dealDamage = new DealDamageEffect(effect, 20);
      dealDamage.target = player.active;
      return store.reduceEffect(state, dealDamage);
    }

    return state;
  }
}
