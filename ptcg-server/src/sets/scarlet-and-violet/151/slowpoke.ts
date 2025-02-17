import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, Resistance, Weakness, Attack } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { HealTargetEffect, RemoveSpecialConditionsEffect } from '../../../game/store/effects/attack-effects';

export class Slowpoke extends PokemonCard {

  public id: number = 79;

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.PSYCHIC];

  public hp: number = 80;

  public weakness: Weakness[] = [{ type: CardType.DARKNESS }];

  public resistance: Resistance[] = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks: Attack[] = [{
    name: 'Sea Bathing',
    cost: [CardType.PSYCHIC],
    damage: 0,
    text: 'Heal 30 damage from this Pokémon, and it recovers from all Special Conditions.'
  }, {
    name: 'Headbutt',
    cost: [CardType.COLORLESS],
    damage: 20,
    text: ''
  }];

  public set: string = 'MEW';

  public name: string = 'Slowpoke';

  public fullName: string = 'Slowpoke MEW';

  
  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    // Sea Bathing
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      const healTargetEffect = new HealTargetEffect(effect, 30);
      healTargetEffect.target = player.active;
      state = store.reduceEffect(state, healTargetEffect);

      const removeSpecialCondition = new RemoveSpecialConditionsEffect(effect, undefined);
      removeSpecialCondition.target = player.active;
      state = store.reduceEffect(state, removeSpecialCondition);

      return state;
    }

    return state;
  }

}
