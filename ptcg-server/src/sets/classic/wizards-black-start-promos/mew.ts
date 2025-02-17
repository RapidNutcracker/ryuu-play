import { StoreLike, State, StateUtils, PlayerType, SlotType, CardTarget, GameError, ChoosePokemonPrompt, PokemonCardList } from '../../../game';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { GameLog, GameMessage } from '../../../game/game-message';
import { CheckProvidedEnergyEffect } from '../../../game/store/effects/check-effects';


function* useDevolutionBeam(next: Function, store: StoreLike, state: State, effect: AttackEffect): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);

  let hasEvolvedPokemon = false;
  const blocked: CardTarget[] = [];
  player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (cardList, card, target) => {
    const pokemonCard = cardList.getPokemonCard();
    if (pokemonCard !== undefined && [Stage.STAGE_1, Stage.STAGE_2].includes(pokemonCard.stage)) {
      hasEvolvedPokemon = true;
    } else {
      blocked.push(target);
    }
  });
  opponent.forEachPokemon(PlayerType.TOP_PLAYER, (cardList, card, target) => {
    const pokemonCard = cardList.getPokemonCard();
    if (pokemonCard !== undefined && [Stage.STAGE_1, Stage.STAGE_2].includes(pokemonCard.stage)) {
      hasEvolvedPokemon = true;
    } else {
      blocked.push(target);
    }
  });

  if (!hasEvolvedPokemon) {
    throw new GameError(GameMessage.CANNOT_USE_ATTACK);
  }

  let targets: PokemonCardList[] = [];
  yield store.prompt(state, new ChoosePokemonPrompt(
    player.id,
    GameMessage.CHOOSE_POKEMON_TO_DISCARD_CARDS,
    PlayerType.ANY,
    [SlotType.ACTIVE, SlotType.BENCH],
    { min: 1, max: 1, allowCancel: false, blocked }
  ), results => {
    targets = results || [];
    next();
  });

  if (targets.length === 0) {
    return state;
  }

  targets.forEach(target => {
    const owner = StateUtils.findOwner(state, target);
    const evolutionCard: PokemonCard | undefined = target.getPokemonCard();

    if (evolutionCard === undefined) {
      throw new GameError(GameMessage.UNKNOWN_CARD);
    }

    store.log(state, GameLog.LOG_PLAYER_DISCARDS, {
      name: effect.player.name,
      card: evolutionCard.name
    });

    target.moveCardTo(evolutionCard, owner.discard);
    target.clearEffects();
  });

  return state;
}

export class Mew extends PokemonCard {

  public id: number = 8;

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.PSYCHIC];

  public hp: number = 50;

  public weakness = [{ type: CardType.PSYCHIC }];

  public retreat = [CardType.COLORLESS];

  public attacks = [{
    name: 'Psywave',
    cost: [CardType.PSYCHIC],
    damage: 10,
    text: 'Does 10 damage times the number of Energy cards attached to the Defending Pokémon.'
  }, {
    name: 'Devolution Beam',
    cost: [CardType.PSYCHIC, CardType.PSYCHIC],
    damage: 0,
    text:
      'Choose an evolved Pokémon (your own or your opponent\'s). ' +
      'Return the highest Stage Evolution card on that Pokémon to its player\'s hand. ' +
      'That Pokémon is no longer Asleep, Confused, Paralyzed, or Poisoned, ' +
      'or anything else that might be the result of an attack (just as if you had evolved it).'
  }];

  public set: string = 'WBSP';

  public name: string = 'Mew';

  public fullName: string = 'Mew WBSP';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Psywave
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      const checkProvidedEnergyEffect = new CheckProvidedEnergyEffect(opponent);
      store.reduceEffect(state, checkProvidedEnergyEffect);
      const energyCount = checkProvidedEnergyEffect.energyMap.reduce((left, p) => left + p.provides.length, 0);
      effect.damage = energyCount * 10;
    }

    // Devolution Beam
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const generator = useDevolutionBeam(() => generator.next(), store, state, effect);
      return generator.next().value;
    }
    return state;
  }

}
