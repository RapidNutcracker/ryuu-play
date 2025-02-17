import { AttackEffect } from '../../../game/store/effects/game-effects';
import { Effect } from '../../../game/store/effects/effect';
import { GameMessage } from '../../../game/game-message';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, SuperType } from '../../../game/store/card/card-types';
import {
  StoreLike,
  State,
  Resistance,
  Weakness,
  CoinFlipPrompt,
  PokemonCardList,
  Card,
  ChooseCardsPrompt,
  GameError,
  ShufflePrompt
} from '../../../game';

function* useCallForFamily(next: Function, store: StoreLike, state: State, effect: AttackEffect): IterableIterator<State> {
  const player = effect.player;
  const slots: PokemonCardList[] = player.bench.filter(b => b.cards.length === 0);

  if (slots.length === 0) {
    throw new GameError(GameMessage.CANNOT_USE_ATTACK);
  }

  const blocked: number[] = [];
  player.discard.cards.forEach((card, index) => {
    if (!(card instanceof PokemonCard) || !(card.name === 'Nidoran Male' || card.name === 'Nidoran Female')) {
      blocked.push(index);
    }
  });

  let cards: Card[] = [];
  yield store.prompt(state, new ChooseCardsPrompt(
    player.id,
    GameMessage.CHOOSE_CARD_TO_PUT_ONTO_BENCH,
    player.deck,
    { superType: SuperType.POKEMON, stage: Stage.BASIC },
    { min: 0, max: 1, allowCancel: true }
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


export class NidoranFemale extends PokemonCard {

  public id: number = 57;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.GRASS;

  public hp: number = 70;

  public weakness: Weakness[] = [{ type: CardType.PSYCHIC }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS];

  public attacks = [{
    name: 'Fury Swipes',
    cost: [CardType.GRASS],
    damage: 10,
    text: 'Flip 3 coins. This attack does 10 damage times the number of heads.'
  }, {
    name: 'Call for Family',
    cost: [CardType.GRASS, CardType.GRASS],
    damage: 0,
    text:
      'Search your deck for a Basic Pokémon named Nidoran Male or Nidoran Female and put it onto your Bench. ' +
      'Shuffle your deck afterward. (You can\'t use this attack if your Bench is full.)'
  }];

  public set: string = 'JU';

  public name: string = 'Nidoran Female';

  public fullName: string = 'Nidoran Female JU';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Fury Swipes
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP),
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], results => {
        let heads: number = 0;
        results.forEach(r => { heads += r ? 1 : 0; });
        effect.damage = 10 * heads;
      });
    }

    // Call for Family
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const generator = useCallForFamily(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }

}
