import { Card } from '../../../game/store/card/card';
import { CardTarget, PlayerType, SlotType } from '../../../game/store/actions/play-card-action';
import { ChooseCardsPrompt } from '../../../game/store/prompts/choose-cards-prompt';
import { ChoosePokemonPrompt } from '../../../game/store/prompts/choose-pokemon-prompt';
import { Effect } from '../../../game/store/effects/effect';
import { GameError } from '../../../game/game-error';
import { GameMessage } from '../../../game/game-message';
import { PokemonCardList } from '../../../game/store/state/pokemon-card-list';
import { State } from '../../../game/store/state/state';
import { StateUtils } from '../../../game/store/state-utils';
import { StoreLike } from '../../../game/store/store-like';
import { SuperType, TrainerType } from '../../../game/store/card/card-types';
import { TrainerCard } from '../../../game/store/card/trainer-card';
import { TrainerEffect } from '../../../game/store/effects/play-card-effects';

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);

  let hasPokemonWithEnergy = false;
  const blocked: CardTarget[] = [];
  opponent.forEachPokemon(PlayerType.TOP_PLAYER, (cardList, card, target) => {
    if (cardList.cards.some(c => c.superType === SuperType.ENERGY)) {
      hasPokemonWithEnergy = true;
    } else {
      blocked.push(target);
    }
  });

  if (!hasPokemonWithEnergy) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  let targets: PokemonCardList[] = [];
  yield store.prompt(state, new ChoosePokemonPrompt(
    player.id,
    GameMessage.CHOOSE_POKEMON_TO_DISCARD_CARDS,
    PlayerType.TOP_PLAYER,
    [SlotType.ACTIVE, SlotType.BENCH],
    { allowCancel: false, blocked }
  ), results => {
    targets = results || [];
    next();
  });

  if (targets.length === 0) {
    return state;
  }

  const target = targets[0];
  let cards: Card[] = [];
  yield store.prompt(state, new ChooseCardsPrompt(
    player.id,
    GameMessage.CHOOSE_CARD_TO_DISCARD,
    target,
    { superType: SuperType.ENERGY },
    { min: 1, max: 1, allowCancel: false }
  ), selected => {
    cards = selected;
    next();
  });

  target.moveCardsTo(cards, opponent.discard);
  return state;
}

export class EnergyRemoval extends TrainerCard {

  public trainerType: TrainerType = TrainerType.ITEM;

  public set: string = 'BS';

  public name: string = 'Energy Removal';

  public fullName: string = 'Energy Removal BS';

  public text: string = 'Choose 1 Energy card attached to 1 of your opponent\'s Pokémon and discard it.';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, effect);
      return generator.next().value;
    }
    return state;
  }

}
