import { AddSpecialConditionsEffect } from '../../game/store/effects/attack-effects';
import { AttackEffect } from '../../game/store/effects/game-effects';
import { Effect } from '../../game/store/effects/effect';
import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType, SpecialCondition } from '../../game/store/card/card-types';
import { StoreLike, State, Resistance, Weakness, Attack } from '../../game';

export class Slowbro extends PokemonCard {

  public id: number = 80;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Slowpoke';

  public cardType: CardType = CardType.PSYCHIC;

  public hp: number = 130;

  public weakness: Weakness[] = [{ type: CardType.DARKNESS }];

  public resistance: Resistance[] = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks: Attack[] = [{
    name: 'Big Yawn',
    cost: [CardType.PSYCHIC],
    damage: 0,
    text: 'Both Active Pokémon are now Asleep.'
  }, {
    name: 'Laid-Back Tackle',
    cost: [CardType.COLORLESS],
    damage: 160,
    text: 'If this Pokémon evolved during this turn, this attack does nothing.'
  }];

  public set: string = 'MEW';

  public name: string = 'Slowbro';

  public fullName: string = 'Slowbro MEW';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    // Big Yawn
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = effect.opponent;

      const addSpecialConditionEffect = new AddSpecialConditionsEffect(effect, [SpecialCondition.ASLEEP]);
      addSpecialConditionEffect.target = opponent.active;
      state = store.reduceEffect(state, addSpecialConditionEffect);

      addSpecialConditionEffect.target = player.active;
      state = store.reduceEffect(state, addSpecialConditionEffect);

      return state;
    }

    // Laid-Back Tackle
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;

      if (player.active.pokemonPlayedTurn === state.turn) {
        effect.preventDefault = true;
        return state;
      }
    }

    return state;
  }

}
