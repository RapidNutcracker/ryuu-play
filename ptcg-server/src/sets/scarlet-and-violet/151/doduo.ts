import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, Attack } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { DealDamageEffect } from '../../../game/store/effects/attack-effects';

export class Doduo extends PokemonCard {

  public id: number = 84;

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.COLORLESS];

  public hp: number = 70;

  public weakness = [{ type: CardType.LIGHTNING }];

  public resistance = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [CardType.COLORLESS];

  public attacks: Attack[] = [{
    name: 'Reckless Charge',
    cost: [CardType.COLORLESS],
    damage: 30,
    text: 'This Pokémon also does 10 damage to itself.'
  }];

  public set: string = 'MEW';

  public name: string = 'Doduo';

  public fullName: string = 'Doduo MEW';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Reckless Charge
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      const selfDamageEffect = new DealDamageEffect(effect, 10);
      selfDamageEffect.target = player.active;
      store.reduceEffect(state, selfDamageEffect);
    }

    return state;
  }
}
