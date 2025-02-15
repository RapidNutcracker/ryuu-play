import { CardTarget, PlayerType, SlotType } from '../../game/store/actions/play-card-action';
import { ChoosePokemonPrompt } from '../../game/store/prompts/choose-pokemon-prompt';
import { Effect } from '../../game/store/effects/effect';
import { GameError } from '../../game/game-error';
import { GameMessage } from '../../game/game-message';
import { PokemonCardList } from '../../game/store/state/pokemon-card-list';
import { State } from '../../game/store/state/state';
import { StoreLike } from '../../game/store/store-like';
import { Stage, TrainerType } from '../../game/store/card/card-types';
import { TrainerCard } from '../../game/store/card/trainer-card';
import { TrainerEffect } from '../../game/store/effects/play-card-effects';
import { PokemonCard } from '../../game/store/card/pokemon-card';
import { SelectPrompt } from '../../game/store/prompts/select-prompt';

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;

  let hasEvolvedPokemon = false;
  const blocked: CardTarget[] = [];
  player.forEachPokemon(PlayerType.TOP_PLAYER, (cardList, card, target) => {
    const pokemonCard = cardList.getPokemonCard();
    if (pokemonCard !== undefined && [Stage.STAGE_1, Stage.STAGE_2].includes(pokemonCard.stage)) {
      hasEvolvedPokemon = true;
    } else {
      blocked.push(target);
    }
  });

  if (!hasEvolvedPokemon) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  let targets: PokemonCardList[] = [];
  yield store.prompt(state, new ChoosePokemonPrompt(
    player.id,
    GameMessage.CHOOSE_POKEMON_TO_DISCARD_CARDS,
    PlayerType.BOTTOM_PLAYER,
    [SlotType.ACTIVE, SlotType.BENCH],
    { allowCancel: false, blocked }
  ), results => {
    targets = results || [];
    next();
  });

  if (targets.length === 0) {
    return state;
  }

  let evolutionCards: PokemonCard[] = targets[0].cards.filter(card =>
    card instanceof PokemonCard &&
    [Stage.STAGE_1, Stage.STAGE_2].includes(card.stage)
  ) as PokemonCard[];

  if (evolutionCards.length > 1) {
    const options: { message: string, value: Stage }[] = [
      { message: 'LABEL_STAGE_1', value: Stage.STAGE_1 },
      { message: 'LABEL_STAGE_2', value: Stage.STAGE_2 },
    ];

    yield store.prompt(state, new SelectPrompt(
      player.id,
      GameMessage.LOOK_AT_WHICH_DECK,
      options.map(c => c.message),
      { allowCancel: false }
    ), choice => {
      const selection: Stage = options[choice].value;

      if (selection === Stage.STAGE_2) {
        evolutionCards = evolutionCards.filter(card => card.stage === Stage.STAGE_2);
      }

      next();
    });
  }

  targets[0].moveCardsTo(evolutionCards, player.discard);
  targets[0].specialConditions = [];
  targets[0].marker.markers = [];

  return state;
}

export class DevolutionSpray extends TrainerCard {

  public id: number = 72;

  public trainerType: TrainerType = TrainerType.ITEM;

  public set: string = 'BS';

  public name: string = 'Devolution Spray';

  public fullName: string = 'Devolution Spray BS';

  public text: string =
    'Choose 1 of your own Pokémon in play and a Stage of Evolution. ' +
    'Discard all Evolution cards of that Stage or higher attached to that Pokémon. ' +
    'That Pokémon is no longer Asleep, Confused, Paralyzed, Poisoned, ' +
    'or anything else that might be the result of an attack (just as if you had evolved it).';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, effect);
      return generator.next().value;
    }
    return state;
  }

}
