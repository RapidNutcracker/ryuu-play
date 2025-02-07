import { AttackEffect } from '../../game/store/effects/game-effects';
import { Card } from '../../game/store/card/card';
import { ChooseCardsPrompt } from '../../game/store/prompts/choose-cards-prompt';
import { Effect } from '../../game/store/effects/effect';
import { GameMessage } from '../../game/game-message';
import { PokemonCard } from '../../game/store/card/pokemon-card';
import { PokemonCardList } from '../../game/store/state/pokemon-card-list';
import { Resistance, Weakness } from '../../game/store/card/pokemon-types';
import { ShufflePrompt } from '../../game/store/prompts/shuffle-prompt';
import { Stage, CardType, SuperType } from '../../game/store/card/card-types';
import { State } from '../../game/store/state/state';
import { StoreLike } from '../../game/store/store-like';
import { CoinFlipPrompt } from '../../game/store/prompts/coin-flip-prompt';

function* useSpreadFilaments(next: Function, store: StoreLike, state: State,
  effect: AttackEffect): IterableIterator<State> {
  const player = effect.player;
  const slots: PokemonCardList[] = player.bench.filter(b => b.cards.length === 0);
  let max: number = 0;

  yield store.prompt(state, [
    new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP),
    new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
  ], results => {
    let heads: number = 0;
    results.forEach(r => { heads += r ? 1 : 0; });
    max = heads;
  });

  if (max === 0) {
    return state;
  }

  let cards: Card[] = [];
  yield store.prompt(state, new ChooseCardsPrompt(
    player.id,
    GameMessage.CHOOSE_CARD_TO_PUT_ONTO_BENCH,
    player.deck,
    { superType: SuperType.POKEMON, stage: Stage.BASIC, cardType: CardType.GRASS },
    { min: 0, max, allowCancel: true }
  ), selected => {
    cards = selected || [];
    next();
  });

  if (cards.length > slots.length) {
    cards.length = slots.length;
  }

  cards.forEach((card, index) => {
    player.deck.moveCardTo(card, slots[index]);
    slots[index].pokemonPlayedTurn = state.turn;
  });

  return store.prompt(state, new ShufflePrompt(player.id), order => {
    player.deck.applyOrder(order);
  });
}

export class Parasect extends PokemonCard {

  public id: number = 47;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Paras';

  public cardType: CardType = CardType.GRASS;

  public hp: number = 120;

  public weakness: Weakness[] = [{ type: CardType.FIRE }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [{
    name: 'Spread Filaments',
    cost: [CardType.GRASS],
    damage: 0,
    text:
      'Flip 2 coins. Search your deck for a number of {G} Pokémon up to the number of heads ' +
      'and put them onto your Bench. Then, shuffle your deck.'
  },
  {
    name: 'Claw Slash',
    cost: [CardType.COLORLESS, CardType.COLORLESS],
    damage: 50,
    text: ''
  }];

  public set: string = 'MEW';

  public name: string = 'Parasect';

  public fullName: string = 'Parasect MEW';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Spread Filaments
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const generator = useSpreadFilaments(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}
