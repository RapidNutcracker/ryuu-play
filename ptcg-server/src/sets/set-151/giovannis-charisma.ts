import { Card } from '../../game/store/card/card';
import { TrainerCard } from '../../game/store/card/trainer-card';
import { TrainerType, SuperType } from '../../game/store/card/card-types';
import { StoreLike } from '../../game/store/store-like';
import { State } from '../../game/store/state/state';
import { Effect } from '../../game/store/effects/effect';
import { AttachEnergyEffect, TrainerEffect } from '../../game/store/effects/play-card-effects';
import { ChooseCardsPrompt } from '../../game/store/prompts/choose-cards-prompt';
import { GameMessage } from '../../game/game-message';
import { StateUtils } from '../../game/store/state-utils';
import { GameError } from '../../game/game-error';
import { AttachEnergyPrompt, EnergyCard, PlayerType, SlotType } from '../../game';

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);

  const opponentActiveHasEnergyAttached = opponent.active.cards.filter(card => card instanceof EnergyCard).length > 0;

  if (opponentActiveHasEnergyAttached) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  let cards: Card[] = [];
  yield store.prompt(state, new ChooseCardsPrompt(
    player.id,
    GameMessage.CHOOSE_CARD_TO_DISCARD,
    opponent.active,
    { superType: SuperType.ENERGY },
    { min: 1, max: 1, allowCancel: false }
  ), selected => {
    cards = selected;
    next();
  });

  opponent.active.moveCardsTo(cards, opponent.hand);

  const playerHasEnergyInHand = player.hand.cards.filter(card => card instanceof EnergyCard).length > 0;

  if (!playerHasEnergyInHand) {
    return state;
  }

  return store.prompt(state, new AttachEnergyPrompt(
    player.id,
    GameMessage.ATTACH_ENERGY_CARDS,
    player.hand,
    PlayerType.BOTTOM_PLAYER,
    [SlotType.ACTIVE],
    { superType: SuperType.ENERGY },
    { allowCancel: false }
  ), transfers => {
    transfers = transfers || [];
    for (const transfer of transfers) {
      const target = StateUtils.getTarget(state, player, transfer.to);
      const energyCard = transfer.card as EnergyCard;

      const attachEnergyEffect = new AttachEnergyEffect(player, energyCard, target);
      state = store.reduceEffect(state, attachEnergyEffect);
    }
  });
}

export class GiovannisCharisma extends TrainerCard {

  public id: number = 161;

  public trainerType: TrainerType = TrainerType.SUPPORTER;

  public set: string = 'MEW';

  public name: string = 'Giovanni\'s Charisma';

  public fullName: string = 'Giovanni\'s Charisma MEW';

  public text: string =
    'Put an Energy attached to your opponent\'s Active Pokémon into their hand. ' +
    'If you do, attach an Energy card from your hand to your Active Pokémon.';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }

}
