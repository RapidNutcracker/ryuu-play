import { ChoosePokemonPrompt } from '../../../game/store/prompts/choose-pokemon-prompt';
import { Effect } from '../../../game/store/effects/effect';
import { GameMessage } from '../../../game/game-message';
import { PlayerType, SlotType } from '../../../game/store/actions/play-card-action';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Resistance, Weakness } from '../../../game/store/card/pokemon-types';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { State } from '../../../game/store/state/state';
import { StateUtils } from '../../../game/store/state-utils';
import { StoreLike } from '../../../game/store/store-like';
import { AfterDamageEffect } from '../../../game/store/effects/attack-effects';
import { HealEffect } from '../../../game/store/effects/game-effects';

function* useWhirlwind(next: Function, store: StoreLike, state: State, effect: AfterDamageEffect): IterableIterator<State> {
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

export class Butterfree extends PokemonCard {

  public id: number = 33;

  public stage: Stage = Stage.STAGE_2;

  public evolvesFrom: string = 'Metapod';

  public cardType: CardType = CardType.GRASS;

  public hp: number = 70;

  public weakness: Weakness[] = [{ type: CardType.FIRE }];

  public resistance: Resistance[] = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [];

  public attacks = [{
    name: 'Whirlwind',
    cost: [CardType.GRASS],
    damage: 60,
    text: 'Switch out your opponent\'s Active Pokémon to the Bench. (Your opponent chooses the new Active Pokémon.)'
  }, {
    name: 'Mega Drain',
    cost: [CardType.COLORLESS, CardType.COLORLESS],
    damage: 0,
    text:
      'Remove a number of damage counters from Butterfree equal to half the damage done to the ' +
      'Defending Pokémon (after applying Weakness and Resistance) (rounded up to the nearest 10).'
  }];

  public set: string = 'JU';

  public name: string = 'Butterfree';

  public fullName: string = 'Butterfree JU';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Whirlwind
    if (effect instanceof AfterDamageEffect && effect.attack === this.attacks[0]) {
      const generator = useWhirlwind(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    // Mega Drain
    if (effect instanceof AfterDamageEffect && effect.attack === this.attacks[1]) {
      const healAmount = Math.ceil((effect.damage / 2) / 10) * 10;

      const healEffect = new HealEffect(effect.player, effect.source, healAmount);
      state = store.reduceEffect(state, healEffect);
    }

    return state;
  }

}
