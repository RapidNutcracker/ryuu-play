import { Card } from '../../game/store/card/card';
import { GameError } from '../../game/game-error';
import { GameMessage } from '../../game/game-message';
import { TrainerCard } from '../../game/store/card/trainer-card';
import { TrainerType, EnergyType } from '../../game/store/card/card-types';
import { StoreLike } from '../../game/store/store-like';
import { State } from '../../game/store/state/state';
import { Effect } from '../../game/store/effects/effect';
import { PokemonCard } from '../../game/store/card/pokemon-card';
import { TrainerEffect } from '../../game/store/effects/play-card-effects';
import { ChooseCardsPrompt } from '../../game/store/prompts/choose-cards-prompt';
import { EnergyCard } from '../../game/store/card/energy-card';
import { ShufflePrompt } from '../../game/store/prompts/shuffle-prompt';

function* playCard(next: Function, store: StoreLike, state: State,
  self: SuperRod, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;

  let pokemonOrEnergyInDiscard: number = 0;
  const blocked: number[] = [];
  player.discard.cards.forEach((c, index) => {
    const isPokemon = c instanceof PokemonCard;
    const isBasicEnergy = c instanceof EnergyCard && c.energyType === EnergyType.BASIC;
    if (isPokemon || isBasicEnergy) {
      pokemonOrEnergyInDiscard += 1;
    } else {
      blocked.push(index);
    }
  });

  // Player does not have correct cards in discard
  if (pokemonOrEnergyInDiscard === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  // We will discard this card after prompt confirmation
  effect.preventDefault = true;
  player.hand.moveCardTo(self, player.supporter);

  const max = Math.min(3, pokemonOrEnergyInDiscard);
  let cards: Card[] = [];
  yield store.prompt(state, new ChooseCardsPrompt(
    player.id,
    GameMessage.CHOOSE_CARD_TO_DECK,
    player.discard,
    {},
    { min: max, max, allowCancel: true, blocked }
  ), selected => {
    cards = selected || [];
    next();
  });

  // Operation canceled by the user
  if (cards.length === 0) {
    return state;
  }

  player.hand.moveCardTo(self, player.discard);
  player.discard.moveCardsTo(cards, player.deck);

  return store.prompt(state, new ShufflePrompt(player.id), order => {
    player.deck.applyOrder(order);
  });
}

export class SuperRod extends TrainerCard {

  public id: number = 188;

  public trainerType: TrainerType = TrainerType.ITEM;

  public set: string = 'PAL';

  public name: string = 'Super Rod';

  public fullName: string = 'Super Rod PAL';

  public text: string =
    'Shuffle up to 3 in any combination of Pokémon and Basic Energy cards from your discard pile into your deck.';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, this, effect);
      return generator.next().value;
    }

    return state;
  }

}
