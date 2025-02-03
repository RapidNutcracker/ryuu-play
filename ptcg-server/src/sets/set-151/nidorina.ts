import { AttackEffect } from '../../game/store/effects/game-effects';
import { Effect } from '../../game/store/effects/effect';
import { GameMessage } from '../../game/game-message';
import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType, SuperType } from '../../game/store/card/card-types';
import {
  StoreLike,
  State,
  Resistance,
  Weakness,
  Card,
  ChooseCardsPrompt,
  ShuffleDeckPrompt,
  ShowCardsPrompt,
  StateUtils
} from '../../game';


function* useFetchFamily(next: Function, store: StoreLike, state: State,
  effect: AttackEffect): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);

  let cards: Card[] = [];
  yield store.prompt(state, new ChooseCardsPrompt(
    player.id,
    GameMessage.CHOOSE_CARD_TO_PUT_ONTO_BENCH,
    player.deck,
    { superType: SuperType.POKEMON, stage: Stage.BASIC },
    { min: 0, max: 3, allowCancel: true }
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

  return store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
    player.deck.applyOrder(order);
  });
}

export class Nidorina extends PokemonCard {

  public id: number = 30;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Nidoran Female';

  public cardType: CardType = CardType.DARK;

  public hp: number = 90;

  public weakness: Weakness[] = [{ type: CardType.FIGHTING }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: 'Fetch Family',
      cost: [CardType.DARK],
      damage: 0,
      text: 'Search your deck for up to 3 Pokémon, reveal them, and put them into your hand. Then, shuffle your deck.'
    },
    {
      name: 'Sharp Fang',
      cost: [CardType.DARK, CardType.COLORLESS],
      damage: 50,
      text: ''
    }
  ];

  public set: string = 'MEW';

  public name: string = 'Nidorina';

  public fullName: string = 'Nidorina MEW';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Fetch Family
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const generator = useFetchFamily(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }

}
