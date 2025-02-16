import { TrainerCard } from '../../game/store/card/trainer-card';
import { CardType, Stage, SuperType, TrainerType } from '../../game/store/card/card-types';
import { StoreLike } from '../../game/store/store-like';
import { State } from '../../game/store/state/state';
import { Effect } from '../../game/store/effects/effect';
import { CheckPokemonPlayedTurnEffect } from '../../game/store/effects/check-effects';
import { EndTurnEffect } from '../../game/store/effects/game-phase-effects';
import { Attack, Card, CardTarget, ChooseCardsPrompt, ChoosePokemonPrompt, GameError, GameLog, GameMessage, PlayerType, PokemonCard, PokemonCardList, ShufflePrompt, SlotType } from '../../game';
import { AttachPokemonToolEffect } from '../../game/store/effects/play-card-effects';
import { AttackEffect, EvolveEffect } from '../../game/store/effects/game-effects';


function* useEvolution(next: Function, store: StoreLike, state: State, effect: AttackEffect): IterableIterator<State> {
  const player = effect.player;

  // If the deck is empty, we cannot use this attack
  if (player.deck.cards.length === 0) {
    throw new GameError(GameMessage.CANNOT_USE_ATTACK);
  }

  // Check deck for ANY Stage 1 and Stage 2 Pokémon
  const evolvedPokemon: PokemonCard[] = player.deck.cards.filter(card =>
    card instanceof PokemonCard &&
    (card.stage === Stage.STAGE_1 || card.stage === Stage.STAGE_2)
  ) as PokemonCard[];

  // If there are no Evolved Pokémon in the deck, we cannot use Evolution
  if (evolvedPokemon.length === 0) {
    throw new GameError(GameMessage.CANNOT_USE_STADIUM);
  }

  // Check all Pokémon Slots...
  const pokemonThatCannotEvolve: CardTarget[] = [];
  let hasPokemonThatCanEvolve: boolean = false;
  player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (slot, card, target) => {

    // If the Slot is a Basic Pokémon and there is a Stage 1 Pokémon in the deck that it can evolve into
    if (evolvedPokemon.some(s => s.evolvesFrom === card.name)) {

      // Check that the Pokémon is eligible to evolve based on the turn it was played
      const playedTurnEffect = new CheckPokemonPlayedTurnEffect(player, slot);
      store.reduceEffect(state, playedTurnEffect);

      if (playedTurnEffect.pokemonPlayedTurn < state.turn) {
        hasPokemonThatCanEvolve = true;
      } else {
        pokemonThatCannotEvolve.push(target);
      }
    } else {
      pokemonThatCannotEvolve.push(target);
    }
  });

  // If the player has no Basic Pokémon that can evolve
  if (!hasPokemonThatCanEvolve) {
    throw new GameError(GameMessage.CANNOT_USE_ATTACK);
  }

  // Select the Pokémon Slot of the Basic Pokémon
  let selectedPokemonSlots: PokemonCardList[] = [];
  yield store.prompt(state, new ChoosePokemonPrompt(
    player.id,
    GameMessage.CHOOSE_POKEMON_TO_EVOLVE,
    PlayerType.BOTTOM_PLAYER,
    [SlotType.ACTIVE, SlotType.BENCH],
    { min: 1, max: 2, allowCancel: false, blocked: pokemonThatCannotEvolve }
  ), selection => {
    selectedPokemonSlots = selection || [];
    next();
  });

  // Didn't select one...
  if (selectedPokemonSlots.length === 0) {
    return state; // canceled by user
  }

  // For each selected Pokémon...
  for (const pokemonSlot of selectedPokemonSlots) {
    const pokemonCard = pokemonSlot.getPokemonCard();
    if (pokemonCard === undefined) {
      return state;
    }

    // Build block list of Pokémon that do not evolve from the selected Pokémon
    const pokemonThatDoNotEvolveFromTheSelectedPokemon: number[] = [];
    player.deck.cards.forEach((c, index) => {
      if (c instanceof PokemonCard) {
        if (c.evolvesFrom !== pokemonCard.name) {
          pokemonThatDoNotEvolveFromTheSelectedPokemon.push(index);
        }
      }
    });

    // Select the Evolution
    let selectedEvolutionPokemon: Card[] = [];
    yield store.prompt(state, new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_EVOLVE,
      player.deck,
      { superType: SuperType.POKEMON },
      { min: 1, max: 1, allowCancel: true, blocked: pokemonThatDoNotEvolveFromTheSelectedPokemon }
    ), selected => {
      selectedEvolutionPokemon = selected || [];
      next();
    });

    if (selectedEvolutionPokemon.length === 0) {
      store.log(state, GameLog.LOG_TEXT, {
        text: 'Failed to select Evolution Pokémon'
      });

      // player canceled?
      return store.prompt(state, new ShufflePrompt(player.id), order => {
        player.deck.applyOrder(order);
      });
    }

    const evolutionPokemonCard = selectedEvolutionPokemon[0] as PokemonCard;
    if (evolutionPokemonCard === undefined) {
      return state; // invalid target?
    }

    // Evolve!
    player.deck.moveCardTo(evolutionPokemonCard, player.hand);

    const evolveEffect = new EvolveEffect(player, pokemonSlot, evolutionPokemonCard);
    state = store.reduceEffect(state, evolveEffect);

    if (store.hasPrompts()) {
      yield store.waitPrompt(state, () => next());
    }
  }

  // We're done. Shuffle Deck
  return store.prompt(state, new ShufflePrompt(player.id), order => {
    player.deck.applyOrder(order);
  });
}

export class TechnicalMachineEvolution extends TrainerCard {

  public id: number = 178;

  public trainerType: TrainerType = TrainerType.TOOL;

  public set: string = 'PAR';

  public name: string = 'Technical Machine: Evolution';

  public fullName: string = 'Technical Machine: Evolution PAR';

  public text: string =
    'The Pokémon this card is attached to can use the attack on this card. ' +
    '(You still need the necessary Energy to use this attack.) ' +
    'If this card is attached to 1 of your Pokémon, discard it at the end of your turn.';

  public attacks: Attack[] = [{
    name: 'Evolution',
    cost: [CardType.COLORLESS],
    damage: 0,
    text:
      'Choose up to 2 of your Benched Pokémon. ' +
      'For each of those Pokémon, search your deck for a card that evolves from that Pokémon ' +
      'and put it onto that Pokémon to evolve it. Then, shuffle your deck.'
  }];

  public readonly TM_EVOLUTION_MARKER = 'TM_EVOLUTION_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttachPokemonToolEffect && effect.trainerCard === this) {
      const pokemonCard = effect.target.getPokemonCard();

      if (pokemonCard === undefined) {
        throw new GameError(GameMessage.UNKNOWN_CARD);
      }

      effect.player.marker.addMarker(this.TM_EVOLUTION_MARKER, this);
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const generator = useEvolution(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    if (effect instanceof EndTurnEffect && effect.player.marker.hasMarker(this.TM_EVOLUTION_MARKER, this)) {
      const player = effect.player;

      player.marker.removeMarker(this.TM_EVOLUTION_MARKER, this);
      player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (cardList) => {
        if (cardList.tool === this) {
          cardList.moveCardTo(this, player.discard);
          cardList.tool = undefined;
        }
      });
    }

    return state;
  }

}
