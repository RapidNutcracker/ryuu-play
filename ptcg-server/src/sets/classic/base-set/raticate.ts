import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, Resistance, StateUtils } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { CheckHpEffect } from '../../../game/store/effects/check-effects';

export class Raticate extends PokemonCard {

  public id: number = 40;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Rattata';

  public cardType: CardType = CardType.COLORLESS;

  public hp: number = 60;

  public weakness = [{ type: CardType.FIGHTING }];

  public resistance: Resistance[] = [{ type: CardType.PSYCHIC, value: -30 }];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: 'Bite',
      cost: [CardType.COLORLESS],
      damage: 20,
      text: ''
    },
    {
      name: 'Super Fang',
      cost: [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS],
      damage: 0,
      text: 'Does damage to the Defending Pokémon equal to half the Defending Pokémon\'s remaining HP (rounded up to the nearest 10).'
    }
  ];

  public set: string = 'BS';

  public name: string = 'Raticate';

  public fullName: string = 'Raticate BS';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Super Fang
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      const checkHpEffect = new CheckHpEffect(opponent, opponent.active);
      state = store.reduceEffect(state, checkHpEffect);
      const remainingHP = checkHpEffect.hp - opponent.active.damage;

      effect.damage = Math.ceil((remainingHP / 2) / 10) * 10;
    }

    return state;
  }
}
