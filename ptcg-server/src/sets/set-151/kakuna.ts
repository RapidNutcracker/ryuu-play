import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';
import { StoreLike, State, Resistance, Weakness, PowerType } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AbstractAttackEffect, DealDamageEffect } from '../../game/store/effects/attack-effects';

export class Kakuna extends PokemonCard {

  public id: number = 14;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Weedle';

  public cardType: CardType = CardType.GRASS;

  public hp: number = 80;

  public weakness: Weakness[] = [{ type: CardType.FIRE }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public powers = [{
    name: 'Cocoon Cover',
    useWhenInPlay: true,
    powerType: PowerType.ABILITY,
    text:
      'Prevent all effects of attacks used by your opponent\'s Pokémon ' +
      'done to this Pokémon. (Damage is not an effect.)'
  }];

  public attacks = [
    {
      name: 'Zzzt',
      cost: [CardType.COLORLESS, CardType.COLORLESS],
      damage: 20,
      text: ''
    }
  ];

  public set: string = 'MEW';

  public name: string = 'Kakuna';

  public fullName: string = 'Kakuna MEW';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    if (effect instanceof AbstractAttackEffect && effect.target.cards.includes(this)) {
      effect.preventDefault = true;

      const dealDamageEffect = new DealDamageEffect(effect.attackEffect, effect.attack.damage);
      state = store.reduceEffect(state, dealDamageEffect);

      return state;
    }

    return state;
  }

}
