import { TrainerCard } from '../../game/store/card/trainer-card';
import { EnergyType, TrainerType } from '../../game/store/card/card-types';
import { StoreLike } from '../../game/store/store-like';
import { State } from '../../game/store/state/state';
import { Effect } from '../../game/store/effects/effect';
import { TrainerEffect } from '../../game/store/effects/play-card-effects';
import { Card, ChooseCardsPrompt, EnergyCard, GameError, GameMessage, PokemonCard } from '../../game';


function* playCard(next: Function, store: StoreLike, state: State,
  self: LanasAid, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;

  if (player.discard.cards.length === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  const blocked: number[] = [];
  player.discard.cards.forEach((c, index) => {
    /// TODO: RuleBox overhaul
    const isPokemonWithoutRulebox = c instanceof PokemonCard && c.tags.length === 0;
    const isBasicEnergy = c instanceof EnergyCard && c.energyType === EnergyType.BASIC;
    if (!(isPokemonWithoutRulebox || isBasicEnergy)) {
      blocked.push(index);
    }
  });

  let cards: Card[] = [];
  yield store.prompt(state, new ChooseCardsPrompt(
    player.id,
    GameMessage.CHOOSE_CARD_TO_HAND,
    player.discard,
    {},
    { min: 0, max: 3, allowCancel: false, blocked }
  ), selected => {
    cards = selected || [];
    next();
  });

  player.supporter.moveCardTo(self, player.discard);
  player.discard.moveCardsTo(cards, player.hand);

  return state;
}

export class LanasAid extends TrainerCard {

  public id: number = 155;

  public trainerType: TrainerType = TrainerType.SUPPORTER;

  public tags = [];

  public set: string = 'TWM';

  public name: string = 'Lana\'s Aid';

  public fullName: string = 'Lana\'s Aid TWM';

  public text: string =
    'Put up to 3 in any combination of Pokémon that don\'t have a Rule Box ' +
    'and Basic Energy cards from your discard pile into your hand. ' +
    '(Pokémon ex, Pokémon V, etc. have Rule Boxes.)';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, this, effect);
      return generator.next().value;
    }

    return state;
  }

}
