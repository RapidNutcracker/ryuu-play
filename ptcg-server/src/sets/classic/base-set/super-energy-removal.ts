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
  let hasPokemonWithEnergy = false;
  const player_blocked: CardTarget[] = [];
  player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (cardList, card, target) => {
    if (cardList.cards.some(c => c.superType === SuperType.ENERGY)) {
      hasPokemonWithEnergy = true;
    } else {
      player_blocked.push(target);
    }
  });

  if (!hasPokemonWithEnergy) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  const opponent = StateUtils.getOpponent(state, player);

  hasPokemonWithEnergy = false;
  const opponent_blocked: CardTarget[] = [];
  opponent.forEachPokemon(PlayerType.TOP_PLAYER, (cardList, card, target) => {
    if (cardList.cards.some(c => c.superType === SuperType.ENERGY)) {
      hasPokemonWithEnergy = true;
    } else {
      opponent_blocked.push(target);
    }
  });

  if (!hasPokemonWithEnergy) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  let player_discard_targets: PokemonCardList[] = [];
  yield store.prompt(state, new ChoosePokemonPrompt(
    player.id,
    GameMessage.CHOOSE_POKEMON_TO_DISCARD_CARDS,
    PlayerType.BOTTOM_PLAYER,
    [SlotType.ACTIVE, SlotType.BENCH],
    { allowCancel: false, blocked: player_blocked }
  ), results => {
    player_discard_targets = results || [];
    next();
  });

  if (player_discard_targets.length === 0) {
    return state;
  }

  const player_target = player_discard_targets[0];
  let player_discarded_energy_cards: Card[] = [];
  yield store.prompt(state, new ChooseCardsPrompt(
    player.id,
    GameMessage.CHOOSE_CARD_TO_DISCARD,
    player_target,
    { superType: SuperType.ENERGY },
    { min: 1, max: 1, allowCancel: false }
  ), selected => {
    player_discarded_energy_cards = selected;
    next();
  });

  player_target.moveCardsTo(player_discarded_energy_cards, player.discard);

  let opponent_discard_targets: PokemonCardList[] = [];
  yield store.prompt(state, new ChoosePokemonPrompt(
    player.id,
    GameMessage.CHOOSE_POKEMON_TO_DISCARD_CARDS,
    PlayerType.TOP_PLAYER,
    [SlotType.ACTIVE, SlotType.BENCH],
    { allowCancel: false, blocked: opponent_blocked }
  ), results => {
    opponent_discard_targets = results || [];
    next();
  });

  if (opponent_discard_targets.length === 0) {
    return state;
  }

  const opponent_target = opponent_discard_targets[0];
  let opponent_discarded_energy_cards: Card[] = [];
  yield store.prompt(state, new ChooseCardsPrompt(
    player.id,
    GameMessage.CHOOSE_CARD_TO_DISCARD,
    opponent_target,
    { superType: SuperType.ENERGY },
    { min: 1, max: 2, allowCancel: false }
  ), selected => {
    opponent_discarded_energy_cards = selected;
    next();
  });

  opponent_target.moveCardsTo(opponent_discarded_energy_cards, opponent.discard);
  return state;
}

export class SuperEnergyRemoval extends TrainerCard {

  public trainerType: TrainerType = TrainerType.ITEM;

  public set: string = 'BS';

  public name: string = 'Super Energy Removal';

  public fullName: string = 'Super Energy Removal BS';

  public text: string =
    'Discard 1 Energy card attached to 1 of your own Pokémon ' +
    'in order to choose 1 of your opponent\'s Pokémon and up to 2 Energy cards attached to it. ' +
    'Discard those Energy cards.';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, effect);
      return generator.next().value;
    }
    return state;
  }

}
