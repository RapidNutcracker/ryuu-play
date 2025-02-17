import { AttackEffect } from '../../../game/store/effects/game-effects';
import { Card } from '../../../game/store/card/card';
import { ChooseCardsPrompt } from '../../../game/store/prompts/choose-cards-prompt';
import { Effect } from '../../../game/store/effects/effect';
import { GameMessage } from '../../../game/game-message';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { PokemonCardList } from '../../../game/store/state/pokemon-card-list';
import { Resistance, Weakness } from '../../../game/store/card/pokemon-types';
import { ShufflePrompt } from '../../../game/store/prompts/shuffle-prompt';
import { Stage, CardType, SuperType } from '../../../game/store/card/card-types';
import { State } from '../../../game/store/state/state';
import { StoreLike } from '../../../game/store/store-like';
import { GameError } from '../../../game';

function* useGatherTheCrew(next: Function, store: StoreLike, state: State,
  effect: AttackEffect): IterableIterator<State> {
  const player = effect.player;
  const slots: PokemonCardList[] = player.bench.filter(b => b.cards.length === 0);
  const max = Math.min(slots.length, 1);

  if (max === 0) {
    throw new GameError(GameMessage.CANNOT_USE_ATTACK);
  }

  let cards: Card[] = [];
  yield store.prompt(state, new ChooseCardsPrompt(
    player.id,
    GameMessage.CHOOSE_CARD_TO_PUT_ONTO_BENCH,
    player.deck,
    { superType: SuperType.POKEMON, stage: Stage.BASIC },
    { min: 0, max, allowCancel: true }
  ), selected => {
    cards = selected || [];
    next();
  });

  if (cards.length > slots.length) {
    cards.length = slots.length;
  }

  cards.forEach((card, index) => {
    player.deck.moveCardTo(card, slots[index]);
    slots[index].pokemonPlayedTurn = state.turn;
  });

  return store.prompt(state, new ShufflePrompt(player.id), order => {
    player.deck.applyOrder(order);
  });
}

export class Tauros extends PokemonCard {

  public id: number = 128;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.COLORLESS;

  public hp: number = 50;

  public weakness: Weakness[] = [{ type: CardType.LIGHTNING }];

  public resistance: Resistance[] = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [{
    name: 'Gather the Crew',
    cost: [CardType.COLORLESS],
    damage: 0,
    text:
      'Search your deck for a Basic Pokémon and put it onto your Bench. '
      + 'Then, shuffle your deck.'
  },
  {
    name: 'Rage',
    cost: [CardType.COLORLESS, CardType.COLORLESS],
    damage: 30,
    text: 'This attack does 10 more damage for each damage counter on this Pokémon.'
  }];

  public set: string = 'MEW';

  public name: string = 'Tauros';

  public fullName: string = 'Tauros MEW';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Gather the Crew
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const generator = useGatherTheCrew(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    // Rage
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      effect.damage += effect.player.active.damage;
    }

    return state;
  }
}
