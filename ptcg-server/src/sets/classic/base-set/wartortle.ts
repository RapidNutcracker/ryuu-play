import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, CoinFlipPrompt, Resistance, Weakness, PlayerType, StateUtils } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { GameMessage } from '../../../game/game-message';
import { PutDamageEffect } from '../../../game/store/effects/attack-effects';
import { EndTurnEffect } from '../../../game/store/effects/game-phase-effects';

export class Wartortle extends PokemonCard {

  public id: number = 42;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Squirtle';

  public cardType: CardType = CardType.WATER;

  public hp: number = 70;

  public weakness: Weakness[] = [{ type: CardType.LIGHTNING }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: 'Withdraw',
      cost: [CardType.WATER, CardType.COLORLESS],
      damage: 0,
      text: 'Flip a coin. If heads, prevent all damage done to Wartortle during your opponent\'s next turn. (Any other effects of attacks still happen.)'
    },
    {
      name: 'Bite',
      cost: [CardType.WATER, CardType.COLORLESS, CardType.COLORLESS],
      damage: 40,
      text: ''
    }
  ];

  public set: string = 'BS';

  public name: string = 'Wartortle';

  public fullName: string = 'Wartortle BS';

  public readonly WITHDRAW_MARKER = 'WITHDRAW_MARKER';

  public readonly CLEAR_WITHDRAW_MARKER = 'CLEAR_WITHDRAW_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Withdraw
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      state = store.prompt(state, new CoinFlipPrompt(
        player.id,
        GameMessage.COIN_FLIP
      ), flipResult => {
        if (flipResult) {
          player.active.marker.addMarker(this.WITHDRAW_MARKER, this);
          opponent.marker.addMarker(this.CLEAR_WITHDRAW_MARKER, this);
        }
      });

      return state;
    }

    if (effect instanceof PutDamageEffect && effect.target.marker.hasMarker(this.WITHDRAW_MARKER)) {
      effect.preventDefault = true;
      return state;
    }

    if (effect instanceof EndTurnEffect && effect.player.marker.hasMarker(this.CLEAR_WITHDRAW_MARKER, this)) {

      effect.player.marker.removeMarker(this.CLEAR_WITHDRAW_MARKER, this);

      const opponent = StateUtils.getOpponent(state, effect.player);
      opponent.forEachPokemon(PlayerType.TOP_PLAYER, (cardList) => {
        cardList.marker.removeMarker(this.WITHDRAW_MARKER, this);
      });
    }

    return state;
  }

}
