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
  Card,
  ChooseCardsPrompt,
  ShufflePrompt,
  ShowCardsPrompt,
  StateUtils
} from '../../../game';

function* useHopOnMyBack(next: Function, store: StoreLike, state: State,
  effect: AttackEffect): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);

  let cards: Card[] = [];
  yield store.prompt(state, new ChooseCardsPrompt(
    player.id,
    GameMessage.CHOOSE_CARD_TO_HAND,
    player.deck,
    { superType: SuperType.POKEMON },
    { min: 0, max: 2, allowCancel: true }
  ), selected => {
    cards = selected || [];
    next();
  });

  if (cards.length > 0) {
    yield store.prompt(state, new ShowCardsPrompt(
      opponent.id,
      GameMessage.CARDS_SHOWED_BY_THE_OPPONENT,
      cards
    ), () => next());
  }

  player.deck.moveCardsTo(cards, player.hand);

  return store.prompt(state, new ShufflePrompt(player.id), order => {
    player.deck.applyOrder(order);
  });
}

export class Lapras extends PokemonCard {

  public id: number = 131;

  public stage: Stage = Stage.BASIC

  public cardTypes: CardType[] = [CardType.WATER];

  public hp: number = 110;

  public weakness: Weakness[] = [{ type: CardType.LIGHTNING }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS];

  public attacks = [{
    name: 'Hop on My Back',
    cost: [CardType.WATER],
    damage: 0,
    text: 'Search your deck for up to 2 Pokémon, reveal them, and put them into your hand. Then, shuffle your deck.'
  }, {
    name: 'Aqua Edge',
    cost: [CardType.WATER, CardType.COLORLESS, CardType.COLORLESS],
    damage: 90,
    text: ''
  }];

  public set: string = 'MEW';

  public name: string = 'Lapras';

  public fullName: string = 'Lapras MEW';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Hop on My Back
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const generator = useHopOnMyBack(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }

}
