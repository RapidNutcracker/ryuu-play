import { TrainerCard } from '../../game/store/card/trainer-card';
import { EnergyType, SuperType, TrainerType } from '../../game/store/card/card-types';
import { StoreLike } from '../../game/store/store-like';
import { State } from '../../game/store/state/state';
import { Effect } from '../../game/store/effects/effect';
import { Card, ChooseCardsPrompt, EnergyCard, GameError, GameMessage, StateUtils } from '../../game';
import { UseStadiumEffect } from '../../game/store/effects/game-effects';

function* useStadium(next: Function, store: StoreLike, state: State, effect: UseStadiumEffect): IterableIterator<State> {
  const player = effect.player;
  const stadiumUsedTurn = player.stadiumUsedTurn;

  const numberOfBasicEnergyCardsInHand = player.hand.cards.filter(card =>
    card instanceof EnergyCard &&
    card.energyType === EnergyType.BASIC
  ).length;

  if (numberOfBasicEnergyCardsInHand === 0 || player.deck.cards.length === 0) {
    throw new GameError(GameMessage.CANNOT_USE_STADIUM);
  }

  let cards: Card[] = [];
  store.prompt(state, new ChooseCardsPrompt(
    player.id,
    GameMessage.CHOOSE_ENERGIES_TO_DISCARD,
    player.hand,
    { superType: SuperType.ENERGY, energyType: EnergyType.BASIC },
    { allowCancel: false }
  ), selected => {
    cards = selected || [];
    next();
  });

  if (cards.length === 0) {
    player.stadiumUsedTurn = stadiumUsedTurn;
    return state;
  }

  player.hand.moveCardsTo(cards, player.discard);
  player.deck.moveTo(player.hand, 1);

  return state;
}


export class CyclingRoad extends TrainerCard {

  public id: number = 157;

  public trainerType: TrainerType = TrainerType.STADIUM;

  public tags = [];

  public set: string = 'MEW';

  public name: string = 'Cycling Road';

  public fullName: string = 'Cycling Road MEW';

  public text: string =
    'Once during each player\'s turn, that player may discard a Basic Energy card' +
    'from their hand in order to draw a card.';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof UseStadiumEffect && StateUtils.getStadiumCard(state) === this) {
      const generator = useStadium(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }

}
