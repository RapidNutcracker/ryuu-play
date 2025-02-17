import { AddSpecialConditionsEffect } from '../../../game/store/effects/attack-effects';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { Effect } from '../../../game/store/effects/effect';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, SpecialCondition } from '../../../game/store/card/card-types';
import { StoreLike, State, Resistance, Weakness, Attack, Power, CoinFlipPrompt, GameMessage } from '../../../game';

function* useTentacularPanic(next: Function, store: StoreLike, state: State,
  effect: AttackEffect): IterableIterator<State> {
  const player = effect.player;

  let flippedHeadsTotal: number = 0;
  let currentFlipResult: boolean = false;

  do {
    yield store.prompt(
      state,
      new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP),
      (result: boolean) => {
        currentFlipResult = result;
        if (result === true) {
          flippedHeadsTotal += 1;
        }
      }
    );
  } while (!!currentFlipResult);

  if (flippedHeadsTotal === 0) {
    const specialCondition = new AddSpecialConditionsEffect(effect, [SpecialCondition.CONFUSED]);
    state = store.reduceEffect(state, specialCondition);
  }

  effect.damage += 90 * flippedHeadsTotal;

  return state;
}

export class Tentacruel extends PokemonCard {

  public id: number = 73;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Tentacool';

  public cardTypes: CardType[] = [CardType.WATER];

  public hp: number = 120;

  public weakness: Weakness[] = [{ type: CardType.LIGHTNING }];

  public resistance: Resistance[] = [];

  public retreat: CardType[] = [CardType.COLORLESS, CardType.COLORLESS];

  public powers: Power[] = [];

  public attacks: Attack[] = [{
    name: 'Poisonous Whip',
    cost: [CardType.COLORLESS, CardType.COLORLESS],
    damage: 30,
    text: 'Your opponent\'s Active Pokémon is now Poisoned.'
  }, {
    name: 'Tentacular Panic',
    cost: [CardType.WATER, CardType.COLORLESS, CardType.COLORLESS],
    damage: 90,
    text:
      'Flip a coin until you get tails. This attack does 90 damage for each heads. ' +
      'If the first flip is tails, your opponent\'s Active Pokémon is now Confused.'
  }];

  public set: string = 'MEW';

  public name: string = 'Tentacruel';

  public fullName: string = 'Tentacruel MEW';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Poisonous Whip
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const specialCondition = new AddSpecialConditionsEffect(effect, [SpecialCondition.POISONED]);
      return store.reduceEffect(state, specialCondition);
    }

    // Tentacular Panic
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const generator = useTentacularPanic(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }

}
