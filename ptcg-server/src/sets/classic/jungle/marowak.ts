import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { Card, ChooseCardsPrompt, CoinFlipPrompt, GameError, GameMessage, PokemonCardList, ShufflePrompt, State, StoreLike } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';


function* useCallForFriend(next: Function, store: StoreLike, state: State, effect: AttackEffect): IterableIterator<State> {
  const player = effect.player;
  const slots: PokemonCardList[] = player.bench.filter(b => b.cards.length === 0);

  if (slots.length === 0) {
    throw new GameError(GameMessage.CANNOT_USE_ATTACK);
  }

  const blocked: number[] = [];
  player.discard.cards.forEach((card, index) => {
    if (!(card instanceof PokemonCard) || (card.stage !== Stage.BASIC && !card.cardTypes.includes(CardType.FIGHTING))) {
      blocked.push(index);
    }
  });

  let cards: Card[] = [];
  yield store.prompt(state, new ChooseCardsPrompt(
    player.id,
    GameMessage.CHOOSE_CARD_TO_PUT_ONTO_BENCH,
    player.deck,
    {},
    { min: 0, max: 1, allowCancel: true, blocked }
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

export class Marowak extends PokemonCard {

  public id: number = 39;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Cubone';

  public cardTypes: CardType[] = [CardType.FIGHTING];

  public hp: number = 60;

  public weakness = [{ type: CardType.GRASS }];

  public resistance = [{ type: CardType.LIGHTNING, value: -30 }];

  public retreat = [CardType.COLORLESS];

  public attacks = [{
    name: 'Bonemerang',
    cost: [CardType.FIGHTING, CardType.FIGHTING],
    damage: 30,
    text:
      'Flip 2 coins. This attack does 30 damage times the number of heads.'
  }, {
    name: 'Call for Friend',
    cost: [CardType.FIGHTING, CardType.FIGHTING, CardType.COLORLESS],
    damage: 0,
    text:
      'Search your deck for a {F} Basic Pokémon card and put it onto your Bench. ' +
      'Shuffle your deck afterward. (You can\'t use this attack if your Bench is full.)'
  }];

  public set: string = 'JU';

  public name: string = 'Marowak';

  public fullName: string = 'Marowak JU';



  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    // Bonemerang
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP),
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], results => {
        let heads: number = 0;
        results.forEach(r => { heads += r ? 1 : 0; });
        effect.damage = 30 * heads;
      });
    }

    // Call for Friend
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const generator = useCallForFriend(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}
