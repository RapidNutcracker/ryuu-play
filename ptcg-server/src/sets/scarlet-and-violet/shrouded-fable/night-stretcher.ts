import { TrainerCard } from '../../../game/store/card/trainer-card';
import { EnergyType, TrainerType } from '../../../game/store/card/card-types';
import { StoreLike } from '../../../game/store/store-like';
import { State } from '../../../game/store/state/state';
import { Effect } from '../../../game/store/effects/effect';
import { TrainerEffect } from '../../../game/store/effects/play-card-effects';
import { Card, ChooseCardsPrompt, EnergyCard, GameError, GameMessage, PokemonCard } from '../../../game';

function* playCard(next: Function, store: StoreLike, state: State, self: NightStretcher, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;
  let cards: Card[] = [];

  if (player.discard.cards.length === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  const hasPokemonOrBasicEnergyInDiscardPile = player.discard.cards.some((c: Card) =>
    c instanceof PokemonCard || (c instanceof EnergyCard && c.energyType === EnergyType.BASIC)
  );

  if (!hasPokemonOrBasicEnergyInDiscardPile) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  // We will discard this card after prompt confirmation
  effect.preventDefault = true;
  player.hand.moveCardTo(self, player.supporter);

  const blocked: number[] = [];
  player.discard.cards.forEach((card, index) => {
    if (!(card instanceof PokemonCard || (card instanceof EnergyCard && card.energyType === EnergyType.BASIC))) {
      blocked.push(index);
    }
  });

  yield store.prompt(state, new ChooseCardsPrompt(
    player.id,
    GameMessage.CHOOSE_CARD_TO_HAND,
    player.discard,
    {},
    { min: 1, max: 1, allowCancel: false, blocked }
  ), selected => {
    cards = selected || [];
    next();
  });

  player.supporter.moveCardTo(self, player.discard);
  player.discard.moveCardsTo(cards, player.hand);

  return state;
}

export class NightStretcher extends TrainerCard {

  public id: number = 61;

  public trainerType: TrainerType = TrainerType.ITEM;

  public tags = [];

  public set: string = 'SFA';

  public name: string = 'Night Stretcher';

  public fullName: string = 'Night Stretcher SFA';

  public text: string =
    'Put a Pokémon or a Basic Energy card from your discard pile into your hand.';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, this, effect);
      return generator.next().value;
    }

    return state;
  }
}
