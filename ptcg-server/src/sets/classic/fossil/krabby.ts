import { AttackEffect } from '../../../game/store/effects/game-effects';
import { Card } from '../../../game/store/card/card';
import { ChooseCardsPrompt } from '../../../game/store/prompts/choose-cards-prompt';
import { Effect } from '../../../game/store/effects/effect';
import { GameMessage } from '../../../game/game-message';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { PokemonCardList } from '../../../game/store/state/pokemon-card-list';
import { Resistance, Weakness } from '../../../game/store/card/pokemon-types';
import { ShufflePrompt } from '../../../game/store/prompts/shuffle-prompt';
import { Stage, CardType, SuperType } from '../../../game/store/card/card-types';
import { State } from '../../../game/store/state/state';
import { StoreLike } from '../../../game/store/store-like';
import { GameError } from '../../../game';

function* useCallForFamily(next: Function, store: StoreLike, state: State, effect: AttackEffect): IterableIterator<State> {
  const player = effect.player;
  const slots: PokemonCardList[] = player.bench.filter(b => b.cards.length === 0);

  if (slots.length === 0) {
    throw new GameError(GameMessage.CANNOT_USE_ATTACK);
  }

  const blocked: number[] = [];
  player.discard.cards.forEach((card, index) => {
    if (!(card instanceof PokemonCard) || card.name !== 'Krabby') {
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

export class Krabby extends PokemonCard {

  public id: number = 51;

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.WATER];

  public hp: number = 40;

  public weakness: Weakness[] = [{ type: CardType.LIGHTNING }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [{
    name: 'Call for Family',
    cost: [CardType.WATER],
    damage: 0,
    text:
      'Search your deck for a Basic Pokémon named Krabby and put it onto your Bench. ' +
      'Shuffle your deck afterward. (You can\'t use this attack if your Bench is full.)'
  }, {
    name: 'Iron Grip',
    cost: [CardType.WATER, CardType.COLORLESS],
    damage: 20,
    text: ''
  }];

  public set: string = 'FO';

  public name: string = 'Krabby';

  public fullName: string = 'Krabby FO';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Call for Family
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const generator = useCallForFamily(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}
