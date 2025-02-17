import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, SpecialCondition } from '../../../game/store/card/card-types';
import { StoreLike, State, GameMessage, CoinFlipPrompt } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { AddSpecialConditionsEffect } from '../../../game/store/effects/attack-effects';

export class Dewgong extends PokemonCard {

  public id: number = 25;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom = 'Seel';

  public cardTypes: CardType[] = [CardType.WATER];

  public hp: number = 80;

  public weakness = [{ type: CardType.LIGHTNING }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: 'Aurora Beam',
      cost: [CardType.WATER, CardType.WATER, CardType.COLORLESS],
      damage: 50,
      text: ''
    },
    {
      name: 'Ice Beam',
      cost: [CardType.WATER, CardType.WATER, CardType.COLORLESS, CardType.COLORLESS],
      damage: 30,
      text: 'Flip a coin. If heads, the Defending Pokémon is now Paralyzed.'
    },
  ];

  public set: string = 'BS';

  public name: string = 'Dewgong';

  public fullName: string = 'Dewgong BS';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Ice Beam
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], result => {
        if (result === true) {
          const specialConditionEffect = new AddSpecialConditionsEffect(effect, [SpecialCondition.PARALYZED]);
          store.reduceEffect(state, specialConditionEffect);
        }
      });
    }

    return state;
  }
}
