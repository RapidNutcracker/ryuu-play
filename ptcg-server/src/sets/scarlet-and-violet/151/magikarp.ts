import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, Attack, CoinFlipPrompt, GameMessage } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';


function* useSplashySplash(next: Function, store: StoreLike, state: State,
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

  player.deck.moveTo(player.hand, flippedHeadsTotal);

  return state;
}

export class Magikarp extends PokemonCard {

  public id: number = 129;

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.WATER];

  public hp: number = 30;

  public weakness = [{ type: CardType.LIGHTNING }];

  public retreat = [CardType.COLORLESS];

  public attacks: Attack[] = [{
    name: 'Splashy Splash',
    cost: [CardType.WATER],
    damage: 10,
    text: 'Flip a coin until you get tails. For each heads, draw a card.'
  }];

  public set: string = 'MEW';

  public name: string = 'Magikarp';

  public fullName: string = 'Magikarp MEW';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Splashy Splash
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const generator = useSplashySplash(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}
