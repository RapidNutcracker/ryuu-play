import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, Power, PowerType, StateUtils, GamePhase, CoinFlipPrompt, GameMessage } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect, KnockOutEffect } from '../../../game/store/effects/game-effects';
import { AfterDamageEffect, PutDamageEffect } from '../../../game/store/effects/attack-effects';
import { CheckHpEffect } from '../../../game/store/effects/check-effects';

export class Weezing extends PokemonCard {

  public id: number = 110;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Koffing';

  public cardType: CardType = CardType.DARKNESS;

  public hp: number = 60;

  public weakness = [{ type: CardType.FIGHTING }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public powers: Power[] = [{
    name: 'Let\'s Have a Blast',
    powerType: PowerType.ABILITY,
    text:
      'If this Pokémon is in the Active Spot and is Knocked Out ' +
      'by damage from an attack from your opponent\'s Pokémon, flip a coin. ' +
      'If heads, the Attacking Pokémon is Knocked Out.'
  }];

  public attacks = [{
    name: 'Spinning Fumes',
    cost: [CardType.COLORLESS, CardType.COLORLESS],
    damage: 50,
    text: 'This attack also does 10 damage to each of your opponent\'s Benched Pokémon. ' +
      '(Don\'t apply Weakness and Resistance for Benched Pokémon.)'
  }];

  public set: string = 'MEW';

  public name: string = 'Weezing';

  public fullName: string = 'Weezing MEW';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Let's Have a Blast!
    if (effect instanceof AfterDamageEffect && effect.target.getPokemonCard() === this) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      // Weezing is not active Pokémon
      if (player.active.getPokemonCard() !== this) {
        return state;
      }

      // Do not activate between turns, or when it's not opponents turn.
      if (state.phase !== GamePhase.ATTACK || state.players[state.activePlayer] !== opponent) {
        return state;
      }

      const checkHpEffect = new CheckHpEffect(player, effect.target);
      state = store.reduceEffect(state, checkHpEffect);

      if (checkHpEffect.hp <= 0) {
        return store.prompt(state,
          new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP),
          result => {
            if (result === true) {
              const knockOutAttackerEffect = new KnockOutEffect(player, effect.source);
              state = store.reduceEffect(state, knockOutAttackerEffect);
            }
          });
      }

      return state;
    }

    // Spinning Fumes
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const opponent = effect.opponent;
      const benched = opponent.bench.filter(b => b.cards.length > 0);

      benched.forEach(target => {
        const damageEffect = new PutDamageEffect(effect, 10);
        damageEffect.target = target;
        store.reduceEffect(state, damageEffect);
      });
    }

    return state;
  }
}
