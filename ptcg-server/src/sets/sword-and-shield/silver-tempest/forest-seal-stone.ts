import { TrainerCard } from '../../../game/store/card/trainer-card';
import { CardTag, TrainerType } from '../../../game/store/card/card-types';
import { StoreLike } from '../../../game/store/store-like';
import { State } from '../../../game/store/state/state';
import { Effect } from '../../../game/store/effects/effect';
import { Card, ChooseCardsPrompt, GameError, GameMessage, PokemonCardList, Power, PowerType, ShufflePrompt, StateUtils } from '../../../game';
import { PowerEffect } from '../../../game/store/effects/game-effects';

function* useStarAlchemy(next: Function, store: StoreLike, state: State, effect: PowerEffect): IterableIterator<State> {
  const player = effect.player;
  const slot = StateUtils.findCardList(state, effect.card) as PokemonCardList;

  if (player.usedVStarPower) {
    throw new GameError(GameMessage.POWER_ALREADY_USED)
  }

  // If the deck is empty, we cannot use this attack
  if (player.deck.cards.length === 0 || !slot.getPokemonCard()?.tags.includes(CardTag.V)) {
    throw new GameError(GameMessage.CANNOT_USE_POWER);
  }

  let cards: Card[] = [];
  yield store.prompt(state, new ChooseCardsPrompt(
    player.id,
    GameMessage.CHOOSE_CARD_TO_HAND,
    player.deck,
    {},
    { min: 1, max: 1, allowCancel: false }
  ), selected => {
    cards = selected || [];
    next();
  });

  player.usedVStarPower = true;

  player.deck.moveCardsTo(cards, player.hand);

  return store.prompt(state, new ShufflePrompt(player.id), order => {
    player.deck.applyOrder(order);
  });
}

export class ForestSealStone extends TrainerCard {

  public id: number = 156;

  public trainerType: TrainerType = TrainerType.TOOL;

  public set: string = 'SIT';

  public name: string = 'Forest Seal Stone';

  public fullName: string = 'Forest Seal Stone SIT';

  public text: string =
    'VSTAR Power' +
    'The Pokémon V this card is attached to can use the VSTAR Power on this card.' +
    '\n' +
    'During your turn, you may search your deck for a card and put it into your hand. ' +
    'Then, shuffle your deck. (You can\'t use more than 1 VSTAR Power in a game.)';

  public powers: Power[] = [{
    name: 'Star Alchemy',
    powerType: PowerType.ABILITY,
    useWhenInPlay: true,
    text:
      'During your turn, you may search your deck for a card and put it into your hand. ' +
      'Then, shuffle your deck. (You can\'t use more than 1 VSTAR Power in a game.)'
  }];

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const generator = useStarAlchemy(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }

}
