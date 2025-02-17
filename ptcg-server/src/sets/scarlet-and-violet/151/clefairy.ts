import { AttackEffect } from '../../../game/store/effects/game-effects';
import { Card } from '../../../game/store/card/card';
import { ChooseCardsPrompt } from '../../../game/store/prompts/choose-cards-prompt';
import { Effect } from '../../../game/store/effects/effect';
import { GameMessage } from '../../../game/game-message';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { PokemonCardList } from '../../../game/store/state/pokemon-card-list';
import { Resistance, Weakness } from '../../../game/store/card/pokemon-types';
import { ShufflePrompt } from '../../../game/store/prompts/shuffle-prompt';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { State } from '../../../game/store/state/state';
import { StoreLike } from '../../../game/store/store-like';

function* useMoonViewingInvitation(next: Function, store: StoreLike, state: State,
  effect: AttackEffect): IterableIterator<State> {
  const player = effect.player;
  const slots: PokemonCardList[] = player.bench.filter(b => b.cards.length === 0);
  const max = Math.min(slots.length, 3);

  let cards: Card[] = [];
  yield store.prompt(state, new ChooseCardsPrompt(
    player.id,
    GameMessage.CHOOSE_CARD_TO_PUT_ONTO_BENCH,
    player.deck,
    { name: 'Clefairy' },
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

export class Clefairy extends PokemonCard {

  public id: number = 35;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.PSYCHIC;

  public hp: number = 60;

  public weakness: Weakness[] = [{ type: CardType.METAL }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS];

  public attacks = [{
    name: 'Moon-Viewing Invitation',
    cost: [CardType.PSYCHIC],
    damage: 0,
    text:
      'Search your deck for up to 3 Clefairy and put them onto your Bench. Then, shuffle your deck.'
  }, {
    name: 'Smack',
    cost: [CardType.PSYCHIC, CardType.COLORLESS],
    damage: 20,
    text: ''
  }];

  public set: string = 'MEW';

  public name: string = 'Clefairy';

  public fullName: string = 'Clefairy MEW';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Moon-Viewing Invitation
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const generator = useMoonViewingInvitation(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}
