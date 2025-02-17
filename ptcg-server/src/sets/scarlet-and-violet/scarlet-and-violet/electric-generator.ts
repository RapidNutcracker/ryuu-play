import { TrainerCard } from '../../../game/store/card/trainer-card';
import { CardType, EnergyType, SuperType, TrainerType } from '../../../game/store/card/card-types';
import { StoreLike } from '../../../game/store/store-like';
import { State } from '../../../game/store/state/state';
import { Effect } from '../../../game/store/effects/effect';
import { AttachEnergyEffect, TrainerEffect } from '../../../game/store/effects/play-card-effects';
import { AttachEnergyPrompt, CardList, EnergyCard, GameError, GameMessage, PlayerType, ShowCardsPrompt, ShufflePrompt, SlotType, StateUtils } from '../../../game';


function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;

  if (player.deck.cards.length === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  const deckTop = new CardList();
  player.deck.moveTo(deckTop, 5);

  const hasLightningEnergyInDeckTop = deckTop.cards.some(c => {
    return c instanceof EnergyCard &&
      c.energyType === EnergyType.BASIC &&
      c.provides.includes(CardType.LIGHTNING);
  });

  if (hasLightningEnergyInDeckTop) {
    yield store.prompt(state, new AttachEnergyPrompt(
      player.id,
      GameMessage.ATTACH_ENERGY_CARDS,
      deckTop,
      PlayerType.BOTTOM_PLAYER,
      [SlotType.BENCH],
      { superType: SuperType.ENERGY, energyType: EnergyType.BASIC },
      { allowCancel: true }
    ), transfers => {
      transfers = transfers || [];
      for (const transfer of transfers) {
        const target = StateUtils.getTarget(state, player, transfer.to);
        const energyCard = transfer.card as EnergyCard;

        const attachEnergyEffect = new AttachEnergyEffect(player, energyCard, target, deckTop);
        state = store.reduceEffect(state, attachEnergyEffect);
      }
      next();
    });
  } else {
    yield store.prompt(state, new ShowCardsPrompt(
      player.id,
      GameMessage.CARDS_SHOWED_BY_EFFECT,
      deckTop.cards
    ), () => {
      next();
    })
  }

  deckTop.moveTo(player.deck);

  return store.prompt(state, new ShufflePrompt(player.id), order => {
    player.deck.applyOrder(order);
  });
}


export class ElectricGenerator extends TrainerCard {

  public id: number = 170;

  public trainerType: TrainerType = TrainerType.ITEM;

  public tags = [];

  public set: string = 'SVI';

  public name: string = 'Electric Generator';

  public fullName: string = 'Electric Generator SVI';

  public text: string =
    'Look at the top 5 cards of your deck and attach up to 2 Basic {L} Energy cards ' +
    'you find there to your Benched {L} Pokémon in any way you like. ' +
    'Shuffle the other cards back into your deck.';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }

}
