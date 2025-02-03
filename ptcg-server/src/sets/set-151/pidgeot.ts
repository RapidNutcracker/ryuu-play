import { AbstractAttackEffect } from '../../game/store/effects/attack-effects';
import { AttackEffect } from '../../game/store/effects/game-effects';
import { CoinFlipPrompt } from '../../game/store/prompts/coin-flip-prompt';
import { Effect } from '../../game/store/effects/effect';
import { EndTurnEffect } from '../../game/store/effects/game-phase-effects';
import { GameMessage } from '../../game/game-message';
import { PlayerType } from '../../game/store/actions/play-card-action';
import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Resistance } from '../../game/store/card/pokemon-types';
import { Stage, CardType } from '../../game/store/card/card-types';
import { State } from '../../game/store/state/state';
import { StateUtils } from '../../game/store/state-utils';
import { StoreLike } from '../../game/store/store-like';

export class Pidgeot extends PokemonCard {

  public id: number = 18;

  public stage: Stage = Stage.STAGE_2;

  public evolvesFrom: string = 'Pidgeot';

  public cardType: CardType = CardType.COLORLESS;

  public hp: number = 130;

  public weakness = [{ type: CardType.LIGHTNING }];

  public resistance: Resistance[] = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [];

  public attacks = [{
    name: 'Flap',
    cost: [CardType.COLORLESS],
    damage: 40,
    text: ''
  }, {
    name: 'Flap',
    cost: [CardType.COLORLESS],
    damage: 150,
    text:
      'Flip a coin. If tails, this attack does nothing. ' +
      'If heads, during your opponent\'s next turn, prevent all damage ' +
      'from and effects of attacks done to this Pokémon.'
  },];

  public set: string = 'MEW';

  public name: string = 'Pidgeot';

  public fullName: string = 'Pidgeot MEW';

  public readonly FLY_MARKER = 'FLY_MARKER';

  public readonly CLEAR_FLY_MARKER = 'CLEAR_FLY_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Fly
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      state = store.prompt(state, new CoinFlipPrompt(
        player.id,
        GameMessage.COIN_FLIP
      ), flipResult => {
        if (flipResult) {
          player.active.marker.addMarker(this.FLY_MARKER, this);
          opponent.marker.addMarker(this.CLEAR_FLY_MARKER, this);
        }
      });

      return state;
    }

    // Fly Active
    if (effect instanceof AbstractAttackEffect && effect.target.marker.hasMarker(this.FLY_MARKER)) {
      effect.preventDefault = true;
      return state;
    }

    // Clear Fly Marker
    if (effect instanceof EndTurnEffect && effect.player.marker.hasMarker(this.CLEAR_FLY_MARKER, this)) {
      effect.player.marker.removeMarker(this.CLEAR_FLY_MARKER, this);

      const opponent = StateUtils.getOpponent(state, effect.player);
      opponent.forEachPokemon(PlayerType.TOP_PLAYER, (cardList) => {
        cardList.marker.removeMarker(this.FLY_MARKER, this);
      });
    }

    return state;
  }
}
