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
    if (!(card instanceof PokemonCard) || card.name !== 'Bellsprout') {
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

export class Bellsprout extends PokemonCard {

  public id: number = 49;

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.GRASS];

  public hp: number = 40;

  public weakness: Weakness[] = [{ type: CardType.FIRE }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS];

  public attacks = [{
    name: 'Vine Whip',
    cost: [CardType.GRASS],
    damage: 10,
    text: ''
  }, {
    name: 'Call for Family',
    cost: [CardType.GRASS],
    damage: 0,
    text:
      'Search your deck for a Basic Pokémon named Bellsprout and put it onto your Bench. ' +
      'Shuffle your deck afterward. (You can\'t use this attack if your Bench is full.)'
  }];

  public set: string = 'JU';

  public name: string = 'Bellsprout';

  public fullName: string = 'Bellsprout JU';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Call for Family
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const generator = useCallForFamily(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}
