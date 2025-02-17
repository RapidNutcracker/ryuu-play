import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, Resistance, Weakness, CoinFlipPrompt, GameMessage } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';


function* useBallRoll(next: Function, store: StoreLike, state: State,
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

  effect.damage += 30 * flippedHeadsTotal;

  return state;
}

export class Exeggcute extends PokemonCard {

  public id: number = 102;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.GRASS;

  public hp: number = 60;

  public weakness: Weakness[] = [{ type: CardType.FIRE }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS];

  public attacks = [{
    name: 'Ball Roll',
    cost: [CardType.GRASS],
    damage: 0,
    text: 'Flip a coin until you get tails. This attack does 30 damage for each heads.'
  }];

  public set: string = 'MEW';

  public name: string = 'Exeggcute';

  public fullName: string = 'Exeggcute MEW';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Ball Roll
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const generator = useBallRoll(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }

}
