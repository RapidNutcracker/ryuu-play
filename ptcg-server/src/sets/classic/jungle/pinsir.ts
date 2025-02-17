import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, SpecialCondition } from '../../../game/store/card/card-types';
import { StoreLike, State, CoinFlipPrompt, GameMessage } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AddSpecialConditionsEffect } from '../../../game/store/effects/attack-effects';
import { AttackEffect } from '../../../game/store/effects/game-effects';

export class Pinsir extends PokemonCard {

  public id: number = 9;

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.GRASS];

  public hp: number = 60;

  public weakness = [{ type: CardType.FIRE }];

  public resistance = [];

  public retreat = [CardType.COLORLESS];

  public powers = [];

  public attacks = [
    {
      name: 'Irongrip',
      cost: [CardType.GRASS, CardType.GRASS],
      damage: 30,
      text:
        'Unless this attack Knocks Out the Defending Pokémon, ' +
        'return the Defending Pokémon and all cards attached to it to your opponent\'s hand.'
    },
    {
      name: 'Guillotine',
      cost: [CardType.GRASS, CardType.GRASS, CardType.COLORLESS, CardType.COLORLESS],
      damage: 50,
      text: ''
    },
  ];

  public set: string = 'JU';

  public name: string = 'Pinsir';

  public fullName: string = 'Pinsir JU';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Irongrip
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], result => {
        if (result === true) {
          const specialConditionEffect = new AddSpecialConditionsEffect(effect, [SpecialCondition.PARALYZED]);
          state = store.reduceEffect(state, specialConditionEffect);
        }
      });
    }

    return state;
  }
}
