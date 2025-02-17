import { AttackEffect } from '../../../game/store/effects/game-effects';
import { Card } from '../../../game/store/card/card';
import { ChooseCardsPrompt } from '../../../game/store/prompts/choose-cards-prompt';
import { Effect } from '../../../game/store/effects/effect';
import { GameMessage } from '../../../game/game-message';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Resistance, Weakness } from '../../../game/store/card/pokemon-types';
import { ShufflePrompt } from '../../../game/store/prompts/shuffle-prompt';
import { Stage, CardType, SuperType } from '../../../game/store/card/card-types';
import { State } from '../../../game/store/state/state';
import { StoreLike } from '../../../game/store/store-like';
import { StateUtils } from '../../../game/store/state-utils';
import { ShowCardsPrompt } from '../../../game/store/prompts/show-cards-prompt';

function* useColorfulFriends(next: Function, store: StoreLike, state: State,
  effect: AttackEffect): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);

  let numberOfPokemonWithDifferentTypesInDeck = 0;
  const typeMap: { [key: number]: boolean } = {};
  player.deck.cards.forEach(c => {
    if (c instanceof PokemonCard) {
      const cardType = c.cardType;
      if (typeMap[cardType] === undefined) {
        numberOfPokemonWithDifferentTypesInDeck += 1;
        typeMap[cardType] = true;
      }
    }
  });

  if (numberOfPokemonWithDifferentTypesInDeck === 0) {
    /// TODO: Show "No Available Pokémon to Choose" message
    return state;
  }

  const max = Math.min(3, numberOfPokemonWithDifferentTypesInDeck);
  let cards: Card[] = [];
  yield store.prompt(state, new ChooseCardsPrompt(
    player.id,
    GameMessage.CHOOSE_CARD_TO_HAND,
    player.deck,
    { superType: SuperType.POKEMON },
    { min: 0, max, allowCancel: true, differentTypes: true }
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

export class Eevee extends PokemonCard {

  public id: number = 133;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.COLORLESS;

  public hp: number = 70;

  public weakness: Weakness[] = [{ type: CardType.FIGHTING }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS];

  public attacks = [{
    name: 'Colorful Friends',
    cost: [CardType.COLORLESS],
    damage: 0,
    text:
      'Search your deck for up to 3 Pokémon of different types, ' +
      'reveal them, and put them into your hand. Then, shuffle your deck.'
  }, {
    name: 'Skip',
    cost: [CardType.COLORLESS],
    damage: 10,
    text: ''
  }];

  public set: string = 'MEW';

  public name: string = 'Eevee';

  public fullName: string = 'Eevee MEW';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Colorful Friends
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const generator = useColorfulFriends(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}
