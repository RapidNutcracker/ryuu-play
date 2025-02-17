import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, SpecialCondition } from '../../../game/store/card/card-types';
import { StoreLike, State, CoinFlipPrompt, Resistance, Weakness } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { GameMessage } from '../../../game/game-message';
import { AddSpecialConditionsEffect } from '../../../game/store/effects/attack-effects';

export class Weepinbell extends PokemonCard {

  public id: number = 48;

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.GRASS];

  public hp: number = 70;

  public weakness: Weakness[] = [{ type: CardType.FIRE }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS];

  public attacks = [{
    name: 'Poisonpowder',
    cost: [CardType.GRASS],
    damage: 10,
    text: 'Flip a coin. If heads, the Defending Pokémon is now Poisoned.'
  }, {
    name: 'Razor Leag',
    cost: [CardType.GRASS, CardType.GRASS],
    damage: 30,
    text: ''
  }];

  public set: string = 'JU';

  public name: string = 'Weepinbell';

  public fullName: string = 'Weepinbell JU';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Poisonpowder
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], result => {
        if (result === true) {
          const specialConditionEffect = new AddSpecialConditionsEffect(effect, [SpecialCondition.POISONED]);
          store.reduceEffect(state, specialConditionEffect);
        }
      });
    }

    return state;
  }

}
