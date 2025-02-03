import { AttackEffect } from '../../game/store/effects/game-effects';
import { ChoosePokemonPrompt } from '../../game/store/prompts/choose-pokemon-prompt';
import { Effect } from '../../game/store/effects/effect';
import { GameMessage } from '../../game/game-message';
import { PlayerType, SlotType } from '../../game/store/actions/play-card-action';
import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Resistance, Weakness } from '../../game/store/card/pokemon-types';
import { ShuffleDeckPrompt } from '../../game/store/prompts/shuffle-prompt';
import { Stage, CardType } from '../../game/store/card/card-types';
import { State } from '../../game/store/state/state';
import { StateUtils } from '../../game/store/state-utils';
import { StoreLike } from '../../game/store/store-like';

function* useWhirlwind(next: Function, store: StoreLike, state: State, effect: AttackEffect): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);

  const opponentHasBenched = opponent.bench.some(b => b.cards.length > 0);
  if (!opponentHasBenched) {
    return state;
  }

  yield store.prompt(state, new ChoosePokemonPrompt(
    player.id,
    GameMessage.CHOOSE_NEW_ACTIVE_POKEMON,
    PlayerType.TOP_PLAYER,
    [SlotType.BENCH],
    { allowCancel: false },
  ), selected => {
    if (!selected || selected.length === 0) {
      return state;
    }

    const target = selected[0];
    opponent.switchPokemon(target);
    next();
  });

  return state;
}

function* useByeByeFlight(next: Function, store: StoreLike, state: State, effect: AttackEffect): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);

  const opponentHasBenched = opponent.bench.some(b => b.cards.length > 0);
  if (!opponentHasBenched) {
    return state;
  }

  yield store.prompt(state, new ChoosePokemonPrompt(
    player.id,
    GameMessage.CHOOSE_CARD_TO_DECK,
    PlayerType.TOP_PLAYER,
    [SlotType.BENCH],
    { allowCancel: false },
  ), selected => {
    if (!selected || selected.length === 0) {
      return state;
    }

    const target = selected[0];
    target.moveTo(opponent.deck);
    next();
  });

  yield store.prompt(state, new ShuffleDeckPrompt(opponent.id), order => {
    opponent.deck.applyOrder(order);
  });

  player.active.moveTo(player.deck);

  yield store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
    player.deck.applyOrder(order);
  });

  return state;
}

export class Butterfree extends PokemonCard {

  public id: number = 12;

  public stage: Stage = Stage.STAGE_2;

  public evolvesFrom: string = 'Metapod';

  public cardType: CardType = CardType.GRASS;

  public hp: number = 130;

  public weakness: Weakness[] = [{ type: CardType.FIRE }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: 'Whirlwind',
      cost: [CardType.GRASS],
      damage: 60,
      text: 'Switch out your opponent\'s Active Pokémon to the Bench. (Your opponent chooses the new Active Pokémon.)'
    },
    {
      name: 'Bye-Bye Flight',
      cost: [CardType.COLORLESS, CardType.COLORLESS],
      damage: 0,
      text:
        'Choose 1 of your opponent\'s Benched Pokémon. ' +
        'Shuffle that Pokémon and all attached cards into their deck, ' +
        'and then shuffle this Pokémon and all attached cards into your deck. ' +
        'If your opponent has no Benched Pokémon, this attack does nothing.'
    }
  ];

  public set: string = 'MEW';

  public name: string = 'Butterfree';

  public fullName: string = 'Butterfree MEW';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Whirlwind
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const generator = useWhirlwind(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    // Bye-Bye Flight
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const generator = useByeByeFlight(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }

}
