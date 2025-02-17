import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { DealDamageEffect, PutDamageEffect } from '../../../game/store/effects/attack-effects';

export class Magneton extends PokemonCard {

  public id: number = 11;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Magnemite';

  public cardType: CardType = CardType.LIGHTNING;

  public hp: number = 80;

  public weakness = [{ type: CardType.FIGHTING }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: 'Sonicboom',
      cost: [CardType.LIGHTNING, CardType.COLORLESS],
      damage: 20,
      text:
        'Don\'t apply Weakness and Resistance for this attack. ' +
        '(Any other effects that would happen after applying Weakness and Resistance still happen.)'
    },
    {
      name: 'Selfdestruct',
      cost: [CardType.LIGHTNING, CardType.LIGHTNING, CardType.LIGHTNING, CardType.LIGHTNING],
      damage: 100,
      text:
        'Does 20 damage to each Pokémon on each player\'s Bench. ' +
        '(Don\'t apply Weakness and Resistance for Benched Pokémon.) ' +
        'Magneton does 100 damage to itself.'
    }
  ];

  public set: string = 'FO';

  public name: string = 'Magneton';

  public fullName: string = 'Magneton FO';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Sonicboom
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      effect.preventDefault = true;

      const putDamageEffect = new PutDamageEffect(effect, 20);
      state = store.reduceEffect(state, putDamageEffect);
    }

    // Selfdestruct
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;
      const opponent = effect.opponent;

      const benched = player.bench.filter(b => b.cards.length > 0).concat(opponent.bench.filter(b => b.cards.length > 0));

      benched.forEach(target => {
        const damageEffect = new PutDamageEffect(effect, 20);
        damageEffect.target = target;
        store.reduceEffect(state, damageEffect);
      });

      const selfDamageEffect = new DealDamageEffect(effect, 100);
      selfDamageEffect.target = player.active;
      store.reduceEffect(state, selfDamageEffect);
    }

    return state;
  }

}
