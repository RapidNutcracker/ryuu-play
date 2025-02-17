import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, StateUtils, CoinFlipPrompt, PlayerType } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { GameMessage } from '../../../game/game-message';
import { AbstractAttackEffect, DealDamageEffect } from '../../../game/store/effects/attack-effects';
import { EndTurnEffect } from '../../../game/store/effects/game-phase-effects';

export class Raichu extends PokemonCard {

  public id: number = 14;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Pikachu';

  public cardType: CardType = CardType.LIGHTNING;

  public hp: number = 80;

  public weakness = [{ type: CardType.FIGHTING }];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: 'Agility',
      cost: [CardType.LIGHTNING, CardType.COLORLESS, CardType.COLORLESS],
      damage: 20,
      text: 'Flip a coin. If heads, during your opponent\'s next turn, prevent all effects of attacks, including damage, done to Raichu.'
    },
    {
      name: 'Thunder',
      cost: [CardType.LIGHTNING, CardType.LIGHTNING, CardType.LIGHTNING, CardType.COLORLESS],
      damage: 60,
      text: 'Flip a coin. If tails, Raichu does 30 damage to itself.'
    }
  ];

  public set: string = 'BS';

  public name: string = 'Raichu';

  public fullName: string = 'Raichu BS';

  public readonly CLEAR_AGILITY_MARKER = 'CLEAR_AGILITY_MARKER';

  public readonly AGILITY_MARKER = 'AGILITY_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Agility
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);
      state = store.prompt(state, new CoinFlipPrompt(
        player.id, GameMessage.COIN_FLIP
      ), flipResult => {
        if (flipResult) {
          player.active.marker.addMarker(this.AGILITY_MARKER, this);
          opponent.marker.addMarker(this.CLEAR_AGILITY_MARKER, this);
        }
      });

      return state;
    }

    // Thunder
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;

      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], result => {
        if (result === false) {
          const dealDamage = new DealDamageEffect(effect, 30);
          dealDamage.target = player.active;
          return store.reduceEffect(state, dealDamage);
        }
      });
    }

    // Has Agility Up
    if (effect instanceof AbstractAttackEffect
      && effect.target.marker.hasMarker(this.AGILITY_MARKER)) {
      effect.preventDefault = true;
      return state;
    }

    // Remove Agility
    if (effect instanceof EndTurnEffect
      && effect.player.marker.hasMarker(this.CLEAR_AGILITY_MARKER, this)) {

      effect.player.marker.removeMarker(this.CLEAR_AGILITY_MARKER, this);

      const opponent = StateUtils.getOpponent(state, effect.player);
      opponent.forEachPokemon(PlayerType.TOP_PLAYER, (cardList) => {
        cardList.marker.removeMarker(this.AGILITY_MARKER, this);
      });
    }

    return state;
  }

}
