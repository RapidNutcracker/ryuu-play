import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, Resistance, Weakness, CoinFlipPrompt, GameMessage } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';


function* useStoneBarrage(next: Function, store: StoreLike, state: State,
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

  effect.damage = 10 * flippedHeadsTotal;

  return state;
}

export class Geodude extends PokemonCard {

  public id: number = 47;

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.FIGHTING];

  public hp: number = 50;

  public weakness: Weakness[] = [{ type: CardType.GRASS }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS];

  public attacks = [{
    name: 'Stone Barrage',
    cost: [CardType.FIGHTING, CardType.COLORLESS],
    damage: 10,
    text: 'Flip a coin until you get tails. This attack does 10 damage for each heads.'
  }];

  public set: string = 'FO';

  public name: string = 'Geodude';

  public fullName: string = 'Geodude FO';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Stone Barrage
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const generator = useStoneBarrage(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }

}
