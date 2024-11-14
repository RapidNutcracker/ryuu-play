import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType, SpecialCondition } from '../../game/store/card/card-types';
import { StoreLike, State, CoinFlipPrompt } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect } from '../../game/store/effects/game-effects';
import { GameMessage } from '../../game/game-message';
import { AddSpecialConditionsEffect } from '../../game/store/effects/attack-effects';

export class Koffing extends PokemonCard {

  public id: number = 51;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.GRASS;

  public hp: number = 50;

  public weakness = [{ type: CardType.PSYCHIC }];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: 'Foul Gas',
      cost: [CardType.GRASS, CardType.GRASS],
      damage: 10,
      text: ' Flip a coin. If heads, the Defending Pokémon is now Poisoned; if tails, it is now Confused.'
    }
  ];

  public set: string = 'BS';

  public name: string = 'Koffing';

  public fullName: string = 'Koffing BS';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Foul Gas
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], result => {

        const specialConditionToApply: SpecialCondition = result ? SpecialCondition.POISONED : SpecialCondition.CONFUSED;
        const specialConditionEffect = new AddSpecialConditionsEffect(effect, [specialConditionToApply]);
        return store.reduceEffect(state, specialConditionEffect);
      });
    }

    return state;
  }
}
