import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';
import { StoreLike, State } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AfterDamageEffect } from '../../game/store/effects/attack-effects';
import { CheckHpEffect } from '../../game/store/effects/check-effects';

export class Pidgeot extends PokemonCard {

  public id: number = 8;

  public stage: Stage = Stage.STAGE_2;

  public evolvesFrom: string = 'Pidgeotto';

  public cardType: CardType = CardType.COLORLESS;

  public hp: number = 80;

  public weakness = [{ type: CardType.LIGHTNING }];

  public resistance = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [];

  public powers = [];

  public attacks = [
    {
      name: 'Wing Attack',
      cost: [CardType.COLORLESS, CardType.COLORLESS],
      damage: 20,
      text: ''
    },
    {
      name: 'Hurricane',
      cost: [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS],
      damage: 30,
      text:
        'Unless this attack Knocks Out the Defending Pokémon, ' +
        'return the Defending Pokémon and all cards attached to it to your opponent\'s hand.'
    },
  ];

  public set: string = 'JU';

  public name: string = 'Pidgeot';

  public fullName: string = 'Pidgeot JU';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Hurricane
    if (effect instanceof AfterDamageEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;
      const opponent = effect.opponent;

      const checkHpEffect = new CheckHpEffect(player, opponent.active);
      state = store.reduceEffect(state, checkHpEffect);

      if (checkHpEffect.hp > 0) {
        opponent.active.moveTo(opponent.hand);
      }
    }

    return state;
  }
}
