import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';
import { StoreLike, State, Power, PowerType } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { PowerEffect } from '../../game/store/effects/game-effects';
import { AbstractAttackEffect, DealDamageEffect } from '../../game/store/effects/attack-effects';

export class Charmeleon extends PokemonCard {

  public id: number = 8;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Charmander';

  public cardType: CardType = CardType.FIRE;

  public hp: number = 90;

  public weakness = [{ type: CardType.WATER }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public powers: Power[] = [{
    name: 'Flare Veil',
    powerType: PowerType.ABILITY,
    text:
      'Prevent all effects of attacks used by your opponent\'s Pokémon ' +
      'done to this Pokémon. (Damage is not an effect.)'
  }]
  public attacks = [{
    name: 'Combustion',
    cost: [CardType.FIRE, CardType.FIRE],
    damage: 50,
    text: ''
  }];

  public set: string = 'PAF';

  public name: string = 'Charmeleon';

  public fullName: string = 'Charmeleon PAF';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Flare Veil
    if (effect instanceof AbstractAttackEffect && effect.target.cards.includes(this)) {
      const player = effect.player;
      effect.preventDefault = true;

      // Try to reduce PowerEffect, to check if something is blocking our ability
      try {
        const powerEffect = new PowerEffect(player, this.powers[0], this);
        store.reduceEffect(state, powerEffect);
      } catch {
        return state;
      }

      const dealDamageEffect = new DealDamageEffect(effect.attackEffect, effect.attack.damage);
      state = store.reduceEffect(state, dealDamageEffect);

      return state;
    }

    return state;
  }
}
