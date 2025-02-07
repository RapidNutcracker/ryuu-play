import { AttackEffect } from '../../game/store/effects/game-effects';
import {
  Card,
  ChooseCardsPrompt,
  GameMessage,
  Resistance,
  ShufflePrompt,
  State,
  StoreLike,
  Weakness
} from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';


function* useBeakCatch(next: Function, store: StoreLike, state: State, effect: AttackEffect): IterableIterator<State> {
  const player = effect.player;

  let cards: Card[] = [];
  yield store.prompt(state, new ChooseCardsPrompt(
    player.id,
    GameMessage.CHOOSE_CARD_TO_HAND,
    player.deck,
    {},
    { min: 0, max: 3, allowCancel: true }
  ), selected => {
    cards = selected || [];
    next();
  });

  player.deck.moveCardsTo(cards, player.hand);

  return store.prompt(state, new ShufflePrompt(player.id), order => {
    player.deck.applyOrder(order);
  });
}

export class Fearow extends PokemonCard {

  public id: number = 22;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Spearow';

  public cardType: CardType = CardType.COLORLESS;

  public hp: number = 90;

  public weakness: Weakness[] = [{ type: CardType.LIGHTNING }];

  public resistance: Resistance[] = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [];


  public attacks = [{
    name: 'Beak Catch',
    cost: [CardType.COLORLESS],
    damage: 0,
    text: 'Search your deck for up to 3 cards and put them into your hand. Then, shuffle your deck.'
  }, {
    name: 'Speed Dive',
    cost: [CardType.COLORLESS],
    damage: 50,
    text: ''
  }];

  public set: string = 'MEW';

  public name: string = 'Fearow';

  public fullName: string = 'Fearow MEW';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Beak Catch
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const generator = useBeakCatch(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }

}
