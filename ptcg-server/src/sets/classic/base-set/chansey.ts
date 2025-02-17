import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, StateUtils, PlayerType, CoinFlipPrompt, Resistance } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { GameMessage } from '../../../game/game-message';
import { EndTurnEffect } from '../../../game/store/effects/game-phase-effects';
import { DealDamageEffect, PutDamageEffect } from '../../../game/store/effects/attack-effects';

export class Chansey extends PokemonCard {

  public id: number = 3;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.COLORLESS;

  public hp: number = 120;

  public weakness = [{ type: CardType.FIGHTING }];

  public resistance: Resistance[] = [{ type: CardType.PSYCHIC, value: -30 }];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: 'Scrunch',
      cost: [CardType.COLORLESS, CardType.COLORLESS],
      damage: 0,
      text: 'Flip a coin. If heads, prevent all damage done to Chansey during your opponent\'s next turn. (Any other effects of attacks still happen.)'
    },
    {
      name: 'Double-edge',
      cost: [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS],
      damage: 80,
      text: 'Chansey does 80 damage to itself.'
    }
  ];

  public set: string = 'BS';

  public name: string = 'Chansey';

  public fullName: string = 'Chansey BS';

  public readonly SCRUNCH_MARKER = 'SCRUNCH_MARKER';

  public readonly CLEAR_SCRUNCH_MARKER = 'CLEAR_SCRUNCH_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    if (effect instanceof PutDamageEffect
      && effect.target.marker.hasMarker(this.SCRUNCH_MARKER)) {
      effect.preventDefault = true;
      return state;
    }

    // Scrunch
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      state = store.prompt(state, new CoinFlipPrompt(
        player.id,
        GameMessage.COIN_FLIP
      ), flipResult => {
        if (flipResult) {
          player.active.marker.addMarker(this.SCRUNCH_MARKER, this);
          opponent.marker.addMarker(this.CLEAR_SCRUNCH_MARKER, this);
        }
      });

      return state;
    }

    // Double-edge
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;

      const dealDamage = new DealDamageEffect(effect, 80);
      dealDamage.target = player.active;
      return store.reduceEffect(state, dealDamage);
    }

    if (effect instanceof EndTurnEffect
      && effect.player.marker.hasMarker(this.CLEAR_SCRUNCH_MARKER, this)) {

      effect.player.marker.removeMarker(this.CLEAR_SCRUNCH_MARKER, this);

      const opponent = StateUtils.getOpponent(state, effect.player);
      opponent.forEachPokemon(PlayerType.TOP_PLAYER, (cardList) => {
        cardList.marker.removeMarker(this.SCRUNCH_MARKER, this);
      });
    }

    return state;
  }

}
