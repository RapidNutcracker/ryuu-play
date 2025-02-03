import { AttackEffect, KnockOutEffect } from '../../game/store/effects/game-effects';
import { Effect } from '../../game/store/effects/effect';
import { GameMessage } from '../../game/game-message';
import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Resistance, Weakness } from '../../game/store/card/pokemon-types';
import { Stage, CardType } from '../../game/store/card/card-types';
import { GamePhase, State } from '../../game/store/state/state';
import { StoreLike } from '../../game/store/store-like';
import { StateUtils } from '../../game/store/state-utils';
import { ChoosePokemonPrompt } from '../../game/store/prompts/choose-pokemon-prompt';
import { PlayerType, SlotType } from '../../game/store/actions/play-card-action';


function* useFollowMe(next: Function, store: StoreLike, state: State, effect: AttackEffect): IterableIterator<State> {
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

export class Clefable extends PokemonCard {

  public id: number = 36;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Clefable';

  public cardType: CardType = CardType.PSYCHIC;

  public hp: number = 100;

  public weakness: Weakness[] = [{ type: CardType.METAL }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [{
    name: 'Follow Me',
    cost: [CardType.PSYCHIC],
    damage: 0,
    text: 'Switch in 1 of your opponent\'s Benched Pokémon to the Active Spot.'
  }, {
    name: 'More Moon',
    cost: [CardType.PSYCHIC, CardType.PSYCHIC, CardType.PSYCHIC],
    damage: 50,
    text: 'If your opponent\'s Pokémon is Knocked Out by damage from this attack, take 1 more Prize card.'
  }];

  public set: string = 'MEW';

  public name: string = 'Clefable';

  public fullName: string = 'Clefable MEW';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Follow Me
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const generator = useFollowMe(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    // More Moon
    if (effect instanceof KnockOutEffect && effect.target === effect.player.active) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      // Do not activate between turns, or when it's not opponents turn.
      if (state.phase !== GamePhase.ATTACK || state.players[state.activePlayer] !== opponent) {
        return state;
      }

      // Clefable wasn't attacking
      const pokemonCard = opponent.active.getPokemonCard();
      if (pokemonCard !== this) {
        return state;
      }

      effect.prizeCount += 1;

      return state;
    }

    return state;
  }
}
