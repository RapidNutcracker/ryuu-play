import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, CoinFlipPrompt, Resistance, Weakness, PlayerType, StateUtils } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { GameMessage } from '../../../game/game-message';
import { DealDamageEffect } from '../../../game/store/effects/attack-effects';
import { EndTurnEffect } from '../../../game/store/effects/game-phase-effects';

export class Onix extends PokemonCard {

  public id: number = 56;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.FIGHTING;

  public hp: number = 90;

  public weakness: Weakness[] = [{ type: CardType.GRASS }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: 'Rock Throw',
      cost: [CardType.FIGHTING],
      damage: 10,
      text: ''
    },
    {
      name: 'Harden',
      cost: [CardType.FIGHTING, CardType.FIGHTING],
      damage: 0,
      text: 'During your opponent\'s next turn, whenever 30 or less damage is done to Onix (after applying Weakness and Resistance), prevent that damage. (Any other effects of attacks still happen.)'
    }
  ];

  public set: string = 'BS';

  public name: string = 'Onix';

  public fullName: string = 'Onix BS';

  public readonly HARDEN_MARKER = 'HARDEN_MARKER';

  public readonly CLEAR_HARDEN_MARKER = 'CLEAR_HARDEN_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Harden
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      state = store.prompt(state, new CoinFlipPrompt(
        player.id,
        GameMessage.COIN_FLIP
      ), flipResult => {
        if (flipResult) {
          player.active.marker.addMarker(this.HARDEN_MARKER, this);
          opponent.marker.addMarker(this.CLEAR_HARDEN_MARKER, this);
        }
      });

      return state;
    }

    if (effect instanceof DealDamageEffect && effect.target.marker.hasMarker(this.HARDEN_MARKER)) {
      if (effect.damage <= 30) {
        effect.damage = 0;
      }

      return state;
    }

    if (effect instanceof EndTurnEffect && effect.player.marker.hasMarker(this.CLEAR_HARDEN_MARKER, this)) {

      effect.player.marker.removeMarker(this.CLEAR_HARDEN_MARKER, this);

      const opponent = StateUtils.getOpponent(state, effect.player);
      opponent.forEachPokemon(PlayerType.TOP_PLAYER, (cardList) => {
        cardList.marker.removeMarker(this.HARDEN_MARKER, this);
      });
    }

    return state;
  }

}
