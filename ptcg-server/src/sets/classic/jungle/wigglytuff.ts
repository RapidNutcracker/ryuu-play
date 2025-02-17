import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, SpecialCondition } from '../../../game/store/card/card-types';
import { StoreLike, State, Resistance } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { AddSpecialConditionsEffect } from '../../../game/store/effects/attack-effects';

export class Wigglytuff extends PokemonCard {

  public id: number = 16;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Jigglypuff';

  public cardType: CardType = CardType.COLORLESS;

  public hp: number = 80;

  public weakness = [{ type: CardType.FIGHTING }];

  public resistance: Resistance[] = [{ type: CardType.PSYCHIC, value: -30 }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [{
    name: 'Lullaby',
    cost: [CardType.COLORLESS, CardType.COLORLESS],
    damage: 0,
    text: 'The Defending Pokémon is now Asleep.'
  }, {
    name: 'Do the Wave',
    cost: [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS],
    damage: 10,
    text:
      'Does 10 damage plus 10 more damage for each of your Benched Pokémon.'
  }];

  public set: string = 'JU';

  public name: string = 'Wigglytuff';

  public fullName: string = 'Wigglytuff JU';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    // Lullaby
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const addSpecialConditionsEffect = new AddSpecialConditionsEffect(effect, [SpecialCondition.ASLEEP]);
      state = store.reduceEffect(state, addSpecialConditionsEffect);
    }

    // Do the Wave
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;

      let numberOfBenchedPokemon: number = player.bench.filter(
        benchSlot => benchSlot.cards.length > 0
      ).length;

      effect.damage += 10 * numberOfBenchedPokemon;
    }

    return state;
  }
}
