import { PowerEffect } from '../../../game/store/effects/game-effects';
import { Effect } from '../../../game/store/effects/effect';
import { EndTurnEffect } from '../../../game/store/effects/game-phase-effects';
import { GameMessage } from '../../../game/game-message';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, SuperType, TrainerType } from '../../../game/store/card/card-types';
import {
  StoreLike,
  State,
  Resistance,
  Weakness,
  Attack,
  Power,
  PowerType,
  PokemonCardList,
  StateUtils,
  GameError,
  PlayerType,
  CardList,
  Card,
  ChooseCardsPrompt,
  ShowCardsPrompt,
  ShufflePrompt
} from '../../../game';


function* useAttractCustomers(next: Function, store: StoreLike, state: State, effect: PowerEffect): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);

  if (player.deck.cards.length === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  const deckTop = new CardList();
  player.deck.moveTo(deckTop, 6);

  let cards: Card[] = [];
  yield store.prompt(state, new ChooseCardsPrompt(
    player.id,
    GameMessage.CHOOSE_CARD_TO_HAND,
    deckTop,
    { superType: SuperType.TRAINER, trainerType: TrainerType.SUPPORTER },
    { min: 1, max: 1, allowCancel: true }
  ), selected => {
    cards = selected || [];
    next();
  });

  deckTop.moveCardsTo(cards, player.hand);
  deckTop.moveTo(player.deck);

  if (cards.length > 0) {
    yield store.prompt(state, new ShowCardsPrompt(
      opponent.id,
      GameMessage.CARDS_SHOWED_BY_THE_OPPONENT,
      cards
    ), () => next());
  }

  return store.prompt(state, new ShufflePrompt(player.id), order => {
    player.deck.applyOrder(order);
  });
}

export class Tatsugiri extends PokemonCard {

  public id: number = 131;

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.DRAGON];

  public hp: number = 70;

  public weakness: Weakness[] = [];

  public resistance: Resistance[] = [];

  public retreat: CardType[] = [CardType.COLORLESS];

  public powers: Power[] = [{
    name: 'Attract Customers',
    powerType: PowerType.ABILITY,
    useWhenInPlay: true,
    text:
      'Once during your turn, ' +
      'if this Pokémon is in the Active Spot, ' +
      'you may look at the top 6 cards of your deck, ' +
      'reveal a Supporter card you find there, ' +
      'and put it into your hand. ' +
      'Shuffle the other cards back into your deck.'
  }];

  public attacks: Attack[] = [{
    name: 'Surf',
    cost: [CardType.WATER, CardType.COLORLESS],
    damage: 50,
    text: ''
  }];

  public set: string = 'TWM';

  public name: string = 'Tatsugiri';

  public fullName: string = 'Tatsugiri TWM';

  public readonly ATTRACT_CUSTOMERS_MARKER = 'ATTRACT_CUSTOMERS_MARKER';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Attract Customers
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const slot = StateUtils.findCardList(state, this) as PokemonCardList;

      if (slot.marker.hasMarker(this.ATTRACT_CUSTOMERS_MARKER, this)) {
        throw new GameError(GameMessage.POWER_ALREADY_USED);
      }

      slot.marker.addMarker(this.ATTRACT_CUSTOMERS_MARKER, this);

      const generator = useAttractCustomers(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    // Clear Attract Customers Marker
    if (effect instanceof EndTurnEffect) {
      effect.player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (cardList) => {
        cardList.marker.removeMarker(this.ATTRACT_CUSTOMERS_MARKER, this);
      });
    }

    return state;
  }

}
