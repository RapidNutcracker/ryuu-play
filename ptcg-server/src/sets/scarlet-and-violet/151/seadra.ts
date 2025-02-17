import { AttackEffect } from '../../../game/store/effects/game-effects';
import { Effect } from '../../../game/store/effects/effect';
import { EndTurnEffect } from '../../../game/store/effects/game-phase-effects';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import {
  StoreLike,
  State,
  Resistance,
  Weakness,
  Attack,
  GameMessage,
  StateUtils,
  CoinFlipPrompt
} from '../../../game';

export class Seadra extends PokemonCard {

  public id: number = 117;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Horsea';

  public cardType: CardType = CardType.WATER;

  public hp: number = 80;

  public weakness: Weakness[] = [{ type: CardType.LIGHTNING }];

  public resistance: Resistance[] = [];

  public retreat: CardType[] = [CardType.COLORLESS];

  public attacks: Attack[] = [{
    name: 'Blinding Ink',
    cost: [CardType.WATER, CardType.COLORLESS, CardType.COLORLESS],
    damage: 50,
    text:
      'During your opponent\'s next turn, ' +
      'if the Defending Pokémon tries to use an attack, ' +
      'your opponent flips 2 coins. ' +
      'If either of them is tails, that attack doesn\'t happen.'
  }];

  public set: string = 'MEW';

  public name: string = 'Seadra';

  public fullName: string = 'Seadra MEW';

  public readonly BLINDING_INK_MARKER = 'BLINDING_INK_MARKER';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    // Blinding Ink
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);
      opponent.active.marker.addMarker(this.BLINDING_INK_MARKER, this);
    }

    // Blinding Ink is Active
    if (effect instanceof AttackEffect && effect.player.active.marker.hasMarker(this.BLINDING_INK_MARKER, this)) {
      const player = effect.player;
      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP),
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP),
      ], results => {
        let heads: number = 0;
        results.forEach(r => { heads += r ? 1 : 0; });

        if (heads < 2) {
          effect.preventDefault = true;
        }
      });
    }

    // Clear Blinding Ink
    if (effect instanceof EndTurnEffect) {
      effect.player.active.marker.removeMarker(this.BLINDING_INK_MARKER, this);
    }

    return state;
  }

}
