import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { DealDamageEffect } from '../../../game/store/effects/attack-effects';

export class Magnemite extends PokemonCard {

  public id: number = 81;

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.LIGHTNING];

  public hp: number = 60;

  public weakness = [{ type: CardType.FIGHTING }];

  public retreat = [CardType.COLORLESS];

  public attacks = [{
    name: 'Tiny Charge',
    cost: [CardType.LIGHTNING],
    damage: 10,
    text: ''
  }, {
    name: 'Big Explosion',
    cost: [CardType.LIGHTNING, CardType.COLORLESS],
    damage: 60,
    text: 'This Pokémon also does 60 damage to itself.'
  }];

  public set: string = 'MEW';

  public name: string = 'Magnemite';

  public fullName: string = 'Magnemite MEW';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Big Explosion
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;

      const selfDamageEffect = new DealDamageEffect(effect, 60);
      selfDamageEffect.target = player.active;
      store.reduceEffect(state, selfDamageEffect);
    }

    return state;
  }

}
