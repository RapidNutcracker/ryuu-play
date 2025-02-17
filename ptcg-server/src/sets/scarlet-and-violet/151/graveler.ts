import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, Resistance, Weakness, CoinFlipPrompt, GameMessage } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';

function* useRockCannon(next: Function, store: StoreLike, state: State,
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

  effect.damage += 40 * flippedHeadsTotal;

  return state;
}

export class Graveler extends PokemonCard {

  public id: number = 77;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Geodude';

  public cardType: CardType = CardType.FIGHTING;

  public hp: number = 110;

  public weakness: Weakness[] = [{ type: CardType.GRASS }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [{
    name: 'Rock Cannon',
    cost: [CardType.FIGHTING],
    damage: 40,
    text: 'Flip a coin until you get tails. This attack does 40 damage for each heads.'
  }, {
    name: 'Heavy Impact',
    cost: [CardType.FIGHTING, CardType.COLORLESS, CardType.COLORLESS],
    damage: 60,
    text: ''
  }];

  public set: string = 'MEW';

  public name: string = 'Graveler';

  public fullName: string = 'Graveler MEW';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Rock Cannon
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const generator = useRockCannon(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }

}
