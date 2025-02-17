import { AddSpecialConditionsEffect, AfterDamageEffect } from '../../../game/store/effects/attack-effects';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import {
  ChoosePokemonPrompt,
  GameMessage,
  PlayerType,
  Resistance,
  SlotType,
  State,
  StoreLike,
  Weakness
} from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, SpecialCondition } from '../../../game/store/card/card-types';

export class Rapidash extends PokemonCard {

  public id: number = 78;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Ponyta';

  public cardType: CardType = CardType.FIRE;

  public hp: number = 100;

  public weakness: Weakness[] = [{ type: CardType.WATER }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS];

  public attacks = [{
    name: 'Singe',
    cost: [CardType.FIRE],
    damage: 0,
    text: 'Your opponent\'s Active Pokémon is now Burned.'
  }, {
    name: 'Mach Turn',
    cost: [CardType.FIRE, CardType.COLORLESS, CardType.COLORLESS],
    damage: 90,
    text: 'Switch this Pokémon with 1 of your Benched Pokémon.'
  }];

  public set: string = 'MEW';

  public name: string = 'Rapidash';

  public fullName: string = 'Rapidash MEW';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    // Singe
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const specialCondition = new AddSpecialConditionsEffect(effect, [SpecialCondition.BURNED]);
      return store.reduceEffect(state, specialCondition);
    }

    // Mach Turn
    if (effect instanceof AfterDamageEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      const hasBenched = player.bench.some(b => b.cards.length > 0);
      if (!hasBenched) {
        return state;
      }

      return store.prompt(state, new ChoosePokemonPrompt(
        player.id,
        GameMessage.CHOOSE_NEW_ACTIVE_POKEMON,
        PlayerType.BOTTOM_PLAYER,
        [SlotType.BENCH],
        { allowCancel: false },
      ), selected => {
        if (!selected || selected.length === 0) {
          return state;
        }
        const target = selected[0];
        player.switchPokemon(target);
      });
    }

    return state;
  }
}
