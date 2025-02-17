import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, CoinFlipPrompt, Resistance, Weakness, PlayerType, StateUtils } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { GameMessage } from '../../../game/game-message';
import { PutDamageEffect } from '../../../game/store/effects/attack-effects';
import { EndTurnEffect } from '../../../game/store/effects/game-phase-effects';

export class Metapod extends PokemonCard {

  public id: number = 11;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Caterpie';

  public cardTypes: CardType[] = [CardType.GRASS];

  public hp: number = 90;

  public weakness: Weakness[] = [{ type: CardType.FIRE }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: 'Tackle',
      cost: [CardType.GRASS],
      damage: 20,
      text: ''
    },
    {
      name: 'Defensive Posture',
      cost: [CardType.COLORLESS, CardType.COLORLESS],
      damage: 0,
      text: 'Flip a coin. If heads, during your opponent\'s next turn, prevent all damage done to this Pokémon by attacks.'
    }
  ];

  public set: string = 'MEW';

  public name: string = 'Metapod';

  public fullName: string = 'Metapod MEW';

  public readonly DEFENSIVE_POSTURE_MARKER = 'DEFENSIVE_POSTURE_MARKER';

  public readonly CLEAR_DEFENSIVE_POSTURE_MARKER = 'CLEAR_DEFENSIVE_POSTURE_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // DEFENSIVE_POSTURE
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      state = store.prompt(state, new CoinFlipPrompt(
        player.id,
        GameMessage.COIN_FLIP
      ), flipResult => {
        if (flipResult) {
          player.active.marker.addMarker(this.DEFENSIVE_POSTURE_MARKER, this);
          opponent.marker.addMarker(this.CLEAR_DEFENSIVE_POSTURE_MARKER, this);
        }
      });

      return state;
    }

    if (effect instanceof PutDamageEffect && effect.target.marker.hasMarker(this.DEFENSIVE_POSTURE_MARKER)) {
      effect.preventDefault = true;
      return state;
    }

    if (effect instanceof EndTurnEffect && effect.player.marker.hasMarker(this.CLEAR_DEFENSIVE_POSTURE_MARKER, this)) {

      effect.player.marker.removeMarker(this.CLEAR_DEFENSIVE_POSTURE_MARKER, this);

      const opponent = StateUtils.getOpponent(state, effect.player);
      opponent.forEachPokemon(PlayerType.TOP_PLAYER, (cardList) => {
        cardList.marker.removeMarker(this.DEFENSIVE_POSTURE_MARKER, this);
      });
    }

    return state;
  }

}
