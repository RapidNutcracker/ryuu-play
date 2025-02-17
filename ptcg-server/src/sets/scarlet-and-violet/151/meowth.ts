import { AttackEffect } from '../../../game/store/effects/game-effects';
import { Effect } from '../../../game/store/effects/effect';
import { GameMessage } from '../../../game/game-message';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Resistance, Weakness } from '../../../game/store/card/pokemon-types';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { State } from '../../../game/store/state/state';
import { StoreLike } from '../../../game/store/store-like';
import { StateUtils } from '../../../game/store/state-utils';
import { ChoosePokemonPrompt } from '../../../game/store/prompts/choose-pokemon-prompt';
import { PlayerType, SlotType } from '../../../game/store/actions/play-card-action';
import { CoinFlipPrompt } from '../../../game/store/prompts/coin-flip-prompt';


function* useComeHereRightMeow(next: Function, store: StoreLike, state: State, effect: AttackEffect): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);

  const opponentHasBenched = opponent.bench.some(b => b.cards.length > 0);
  if (!opponentHasBenched) {
    return state;
  }

  let coinFlipSuccess: boolean = false;
  yield store.prompt(state, [
    new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
  ], result => {
    coinFlipSuccess = result === true;
    next();
  });

  if (!coinFlipSuccess) {
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

export class Meowth extends PokemonCard {

  public id: number = 52;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.COLORLESS;

  public hp: number = 70;

  public weakness: Weakness[] = [{ type: CardType.FIGHTING }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS];

  public attacks = [{
    name: 'Come Here Right Meow',
    cost: [CardType.COLORLESS],
    damage: 0,
    text: 'Flip a coin. If heads, switch in 1 of your opponent\'s Benched Pokémon to the Active Spot.'
  }, {
    name: 'Dig Claws',
    cost: [CardType.COLORLESS, CardType.COLORLESS],
    damage: 20,
    text: ''
  }];

  public set: string = 'MEW';

  public name: string = 'Meowth';

  public fullName: string = 'Meowth MEW';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Come Here Right Meow
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const generator = useComeHereRightMeow(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}
