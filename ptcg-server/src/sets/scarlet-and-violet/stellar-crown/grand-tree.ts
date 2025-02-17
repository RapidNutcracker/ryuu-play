import { TrainerCard } from '../../../game/store/card/trainer-card';
import { CardTag, Stage, SuperType, TrainerType } from '../../../game/store/card/card-types';
import { StoreLike } from '../../../game/store/store-like';
import { State } from '../../../game/store/state/state';
import { Effect } from '../../../game/store/effects/effect';
import { ShufflePrompt } from '../../../game/store/prompts/shuffle-prompt';
import { Card, CardTarget, ChooseCardsPrompt, ChoosePokemonPrompt, ConfirmPrompt, GameError, GameLog, GameMessage, PlayerType, PokemonCard, PokemonCardList, SlotType, StateUtils } from '../../../game';
import { EvolveEffect, UseStadiumEffect } from '../../../game/store/effects/game-effects';
import { CheckPokemonPlayedTurnEffect } from '../../../game/store/effects/check-effects';

function* useStadium(next: Function, store: StoreLike, state: State, effect: UseStadiumEffect): IterableIterator<State> {
  const player = effect.player;

  if (player.deck.cards.length === 0) {
    throw new GameError(GameMessage.CANNOT_USE_STADIUM);
  }

  // Check deck for ANY Stage 1 and Stage 2 Pokémon
  const stage1: PokemonCard[] = player.deck.cards.filter(card =>
    card instanceof PokemonCard &&
    card.stage === Stage.STAGE_1
  ) as PokemonCard[];
  const stage2: PokemonCard[] = player.deck.cards.filter(card =>
    card instanceof PokemonCard &&
    card.stage === Stage.STAGE_2
  ) as PokemonCard[];

  // If there are no Stage 1 Pokémon in the deck, we cannot use Grand Tree
  if (stage1.length === 0) {
    throw new GameError(GameMessage.CANNOT_USE_STADIUM);
  }

  // Check all Pokémon Slots...
  const basicPokemonThatCannotEvolve: CardTarget[] = [];
  let hasBasicPokemonThatCanEvolve: boolean = false;
  player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (list, card, target) => {

    // If the Slot is a Basic Pokémon and there is a Stage 1 Pokémon in the deck that it can evolve into
    if (card.stage === Stage.BASIC && stage1.some(s => s.evolvesFrom === card.name)) {

      // Check that the Basic is eligible to evolve based on turn number
      const playedTurnEffect = new CheckPokemonPlayedTurnEffect(player, list);
      store.reduceEffect(state, playedTurnEffect);

      if (playedTurnEffect.pokemonPlayedTurn < state.turn) {
        hasBasicPokemonThatCanEvolve = true;
      } else {
        basicPokemonThatCannotEvolve.push(target);
      }
    } else {
      basicPokemonThatCannotEvolve.push(target);
    }
  });

  // If the player has no Basic Pokémon that can evolve
  if (!hasBasicPokemonThatCanEvolve) {
    throw new GameError(GameMessage.CANNOT_USE_STADIUM);
  }

  player.stadiumUsedTurn = state.turn;

  // Select the Pokémon Slot of the Basic Pokémon
  let selectedPokemonSlot: PokemonCardList[] = [];
  yield store.prompt(state, new ChoosePokemonPrompt(
    player.id,
    GameMessage.CHOOSE_POKEMON_TO_EVOLVE,
    PlayerType.BOTTOM_PLAYER,
    [SlotType.ACTIVE, SlotType.BENCH],
    { allowCancel: true, blocked: basicPokemonThatCannotEvolve }
  ), selection => {
    selectedPokemonSlot = selection || [];
    next();
  });

  // Didn't select one...
  if (selectedPokemonSlot.length === 0) {
    return state; // canceled by user
  }

  // Get the Basic Pokémon Card from the Slot
  const basicPokemonCard = selectedPokemonSlot[0].getPokemonCard();
  if (basicPokemonCard === undefined) {
    return state; // invalid target?
  }

  // Build list of Stage 1's that do not evolve from the selected basic
  const pokemonThatDoNotEvolveFromTheSelectedBasicPokemon: number[] = [];
  player.deck.cards.forEach((c, index) => {
    if (c instanceof PokemonCard && c.stage === Stage.STAGE_1) {
      if (c.evolvesFrom !== basicPokemonCard.name) {
        pokemonThatDoNotEvolveFromTheSelectedBasicPokemon.push(index);
      }
    }
  });

  // Select the Stage 1 Evolution
  let selectedStage1Pokemon: Card[] = [];
  yield store.prompt(state, new ChooseCardsPrompt(
    player.id,
    GameMessage.CHOOSE_CARD_TO_EVOLVE,
    player.deck,
    { superType: SuperType.POKEMON, stage: Stage.STAGE_1 },
    { min: 1, max: 1, allowCancel: true, blocked: pokemonThatDoNotEvolveFromTheSelectedBasicPokemon }
  ), selected => {
    selectedStage1Pokemon = selected || [];
    next();
  });

  if (selectedStage1Pokemon.length === 0) {
    store.log(state, GameLog.LOG_TEXT, {
      text: 'Failed to select Stage 1 Pokémon'
    });

    // player canceled?
    return store.prompt(state, new ShufflePrompt(player.id), order => {
      player.deck.applyOrder(order);
    });
  }

  const stage1PokemonCard = selectedStage1Pokemon[0] as PokemonCard;
  if (stage1PokemonCard === undefined) {
    return state; // invalid target?
  }

  // Evolve!
  player.deck.moveCardTo(stage1PokemonCard, player.hand);

  const stage1EvolveEffect = new EvolveEffect(player, selectedPokemonSlot[0], stage1PokemonCard);
  state = store.reduceEffect(state, stage1EvolveEffect);

  if (store.hasPrompts()) {
    yield store.waitPrompt(state, () => next());
  }

  // Find if there are Stage 2 Pokémon in the Deck that are from the same line
  let hasStage2Pokemon: boolean = stage2.some(s => s.evolvesFrom === stage1PokemonCard.name);

  // If not, we're done. Shuffle Deck and return.
  if (!hasStage2Pokemon) {
    return store.prompt(state, new ShufflePrompt(player.id), order => {
      player.deck.applyOrder(order);
    });
  }

  // Ask if player wants to evolve again
  let wantToUse = false;
  yield store.prompt(state, new ConfirmPrompt(
    effect.player.id,
    GameMessage.WANT_TO_EVOLVE_AGAIN
  ), result => {
    wantToUse = result;
    next();
  });


  // If not, we're done, Shuffle Deck and return
  if (!wantToUse) {
    return store.prompt(state, new ShufflePrompt(player.id), order => {
      player.deck.applyOrder(order);
    });
  }

  // Build block list of Stage 2 Pokémon that do not evolve from the Stage 1
  const pokemonThatDoNotEvolvedFromSelectedStage1: number[] = [];
  player.deck.cards.forEach((c, index) => {
    if (c instanceof PokemonCard && c.stage === Stage.STAGE_2) {
      if (c.evolvesFrom !== stage1PokemonCard.name) {
        pokemonThatDoNotEvolvedFromSelectedStage1.push(index);
      }
    }
  });

  // Select the Stage 2 Pokémon
  let selectedStage2Pokemon: Card[] = [];
  yield store.prompt(state, new ChooseCardsPrompt(
    player.id,
    GameMessage.CHOOSE_CARD_TO_EVOLVE,
    player.deck,
    { superType: SuperType.POKEMON, stage: Stage.STAGE_2 },
    { min: 1, max: 1, allowCancel: true, blocked: pokemonThatDoNotEvolvedFromSelectedStage1 }
  ), selected => {
    selectedStage2Pokemon = selected || [];
    next();
  });

  if (selectedStage2Pokemon.length === 0) {
    // player canceled?
    return store.prompt(state, new ShufflePrompt(player.id), order => {
      player.deck.applyOrder(order);
    });
  }

  const stage2PokemonCard = selectedStage2Pokemon[0] as PokemonCard;
  if (stage2PokemonCard === undefined) {
    return state; // invalid target?
  }

  // Evolve again!
  player.deck.moveCardTo(stage2PokemonCard, player.hand);

  const stage2EvolveEffect = new EvolveEffect(player, selectedPokemonSlot[0], stage2PokemonCard);
  state = store.reduceEffect(state, stage2EvolveEffect);

  if (store.hasPrompts()) {
    yield store.waitPrompt(state, () => next());
  }

  // We're done. Shuffle Deck
  return store.prompt(state, new ShufflePrompt(player.id), order => {
    player.deck.applyOrder(order);
  });
}


export class GrandTree extends TrainerCard {

  public id: number = 136;

  public trainerType: TrainerType = TrainerType.STADIUM;

  public tags = [CardTag.ACE_SPEC];

  public set: string = 'SCR';

  public name: string = 'Grand Tree';

  public fullName: string = 'Grand Tree SCR';

  public text: string =
    'Once during each player\'s turn, that player may search their deck for a Stage 1 Pokémon' +
    'that evolves from 1 of their Basic Pokémon and put it onto that Pokémon to evolve it. ' +
    'If that Pokémon was evolved in this way, that player may search their deck for a Stage 2 Pokémon ' +
    'that evolves from that Pokémon and put it onto that Pokémon to evolve it. ' +
    'Then, that player shuffles their deck. ' +
    '(Players can\'t evolve a Basic Pokémon during their first turn ' +
    'or a Basic Pokémon that was put into play this turn.)';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof UseStadiumEffect && StateUtils.getStadiumCard(state) === this) {
      const generator = useStadium(() => generator.next(), store, state, effect);
      return generator.next().value;
    }


    return state;
  }

}
