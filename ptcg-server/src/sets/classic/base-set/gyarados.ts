import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, SpecialCondition } from '../../../game/store/card/card-types';
import { StoreLike, State, CoinFlipPrompt, Resistance } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { GameMessage } from '../../../game/game-message';
import { AddSpecialConditionsEffect } from '../../../game/store/effects/attack-effects';

export class Gyarados extends PokemonCard {

  public id: number = 6;
  
  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Magikarp';

  public cardType: CardType = CardType.WATER;

  public hp: number = 100;

  public weakness = [{ type: CardType.LIGHTNING }];

  public resistance: Resistance[] = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: 'Dragon Rage',
      cost: [CardType.WATER, CardType.WATER, CardType.WATER],
      damage: 50,
      text: ''
    },
    {
      name: 'Bubblebeam',
      cost: [CardType.WATER, CardType.WATER, CardType.WATER, CardType.WATER],
      damage: 40,
      text: 'Flip a coin. If heads, the Defending Pokémon is now Paralyzed.'
    }
  ];

  public set: string = 'BS';

  public name: string = 'Gyarados';

  public fullName: string = 'Gyarados BS';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Bubblebeam
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
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
