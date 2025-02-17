import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, SpecialCondition } from '../../../game/store/card/card-types';
import { StoreLike, State, CoinFlipPrompt, Resistance, Weakness } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { GameMessage } from '../../../game/game-message';
import { AddSpecialConditionsEffect } from '../../../game/store/effects/attack-effects';

export class Vulpix extends PokemonCard {

  public id: number = 68;

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.FIRE];

  public hp: number = 50;

  public weakness: Weakness[] = [{ type: CardType.WATER }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: 'Confuse Ray',
      cost: [CardType.FIRE, CardType.FIRE],
      damage: 10,
      text: 'Flip a coin. If heads, the Defending Pokémon is now Confused.'
    }
  ];

  public set: string = 'BS';

  public name: string = 'Vulpix';

  public fullName: string = 'Vulpix BS';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Confuse Ray
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], result => {
        if (result === true) {
          const specialConditionEffect = new AddSpecialConditionsEffect(effect, [SpecialCondition.CONFUSED]);
          store.reduceEffect(state, specialConditionEffect);
        }
      });
    }

    return state;
  }

}
