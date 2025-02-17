import { AttackEffect } from '../../../game/store/effects/game-effects';
import { Effect } from '../../../game/store/effects/effect';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Resistance, State, StoreLike, Weakness } from '../../../game';
import { Stage, CardType } from '../../../game/store/card/card-types';

export class Raticate extends PokemonCard {

  public id: number = 20;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Rattata';

  public cardType: CardType = CardType.COLORLESS;

  public hp: number = 70;

  public weakness: Weakness[] = [{ type: CardType.FIGHTING }];

  public resistance: Resistance[] = [];

  public retreat = [];

  public attacks = [{
    name: 'Second Bite',
    cost: [CardType.COLORLESS, CardType.COLORLESS],
    damage: 30,
    text: 'This attack does 30 more damage for each damage counter on your opponent\'s Active Pokémon.'
  }];

  public set: string = 'MEW';

  public name: string = 'Raticate';

  public fullName: string = 'Raticate MEW';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Second Bite
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      effect.damage += effect.opponent.active.damage * 3;
    }

    return state;
  }

}
