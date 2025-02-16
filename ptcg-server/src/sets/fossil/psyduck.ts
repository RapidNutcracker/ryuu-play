import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';
import { StoreLike, State, Resistance, Weakness, StateUtils, GameError, GameMessage, CoinFlipPrompt } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect } from '../../game/store/effects/game-effects';
import { EndTurnEffect } from '../../game/store/effects/game-phase-effects';
import { TrainerEffect } from '../../game/store/effects/play-card-effects';

export class Psyduck extends PokemonCard {

  public id: number = 53;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.WATER;

  public hp: number = 50;

  public weakness: Weakness[] = [{ type: CardType.LIGHTNING }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS];

  public attacks = [{
    name: 'Headache',
    cost: [CardType.PSYCHIC],
    damage: 0,
    text: 'Your opponent can\'t play Trainer cards during his or her next turn.'
  }, {
    name: 'Fury Swipes',
    cost: [CardType.WATER],
    damage: 10,
    text: 'Flip 3 coins. This attack does 10 damage times the number of heads.'
  }];

  public set: string = 'FO';

  public name: string = 'Psyduck';

  public fullName: string = 'Psyduck FO';

  public readonly HEADACHE_MARKER = 'HEADACHE_MARKER';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Headache
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      opponent.marker.addMarker(this.HEADACHE_MARKER, this);

      return state;
    }

    // Fury Swipes
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;
      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP),
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP),
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], results => {
        let heads: number = 0;
        results.forEach(r => { heads += r ? 1 : 0; });
        effect.damage = 10 * heads;
      });
    }

    // Headache is active
    if (effect instanceof TrainerEffect && effect.player.marker.hasMarker(this.HEADACHE_MARKER, this)) {
      effect.preventDefault = true;

      throw new GameError(GameMessage.BLOCKED_BY_ABILITY);
    }

    // Clear Headache
    if (effect instanceof EndTurnEffect) {
      effect.player.marker.removeMarker(this.HEADACHE_MARKER, this);
    }

    return state;
  }

}
