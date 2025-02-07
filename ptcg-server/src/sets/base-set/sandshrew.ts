import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';
import { StoreLike, State, CoinFlipPrompt, Resistance, Weakness, PlayerType, StateUtils } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect } from '../../game/store/effects/game-effects';
import { GameMessage } from '../../game/game-message';
import { DealDamageEffect } from '../../game/store/effects/attack-effects';
import { EndTurnEffect } from '../../game/store/effects/game-phase-effects';

export class Sandshrew extends PokemonCard {

  public id: number = 62;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.FIGHTING;

  public hp: number = 40;

  public weakness: Weakness[] = [{ type: CardType.GRASS }];

  public resistance: Resistance[] = [{ type: CardType.LIGHTNING, value: -30 }];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: 'Sand Attack',
      cost: [CardType.FIGHTING],
      damage: 10,
      text: 'If the Defending Pokémon tries to attack during your opponent\'s next turn, your opponent flips a coin. If tails, that attack does nothing.'
    }
  ];

  public set: string = 'BS';

  public name: string = 'Sandshrew';

  public fullName: string = 'Sandshrew BS';

  public readonly SAND_ATTACK_MARKER = 'SAND_ATTACK_MARKER';

  public readonly CLEAR_SAND_ATTACK_MARKER = 'CLEAR_SAND_ATTACK_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Sand Attack
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      opponent.active.marker.addMarker(this.SAND_ATTACK_MARKER, this);
      opponent.marker.addMarker(this.CLEAR_SAND_ATTACK_MARKER, this);

      return state;
    }

    if (effect instanceof DealDamageEffect && effect.source.marker.hasMarker(this.SAND_ATTACK_MARKER)) {
      const attackerOwner = StateUtils.findOwner(state, effect.source);

      return store.prompt(state, [
        new CoinFlipPrompt(attackerOwner.id, GameMessage.COIN_FLIP)
      ], result => {
        if (result === false) {
          effect.preventDefault = true;
        }
      });
    }

    if (effect instanceof EndTurnEffect && effect.player.marker.hasMarker(this.CLEAR_SAND_ATTACK_MARKER, this)) {

      effect.player.marker.removeMarker(this.CLEAR_SAND_ATTACK_MARKER, this);

      const opponent = StateUtils.getOpponent(state, effect.player);
      opponent.forEachPokemon(PlayerType.TOP_PLAYER, (cardList) => {
        cardList.marker.removeMarker(this.SAND_ATTACK_MARKER, this);
      });
    }

    return state;
  }

}
