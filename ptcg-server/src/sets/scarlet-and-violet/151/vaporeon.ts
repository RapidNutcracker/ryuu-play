import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, CardTag } from '../../../game/store/card/card-types';
import { StoreLike, State, Resistance, Weakness, Attack, Power, StateUtils } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AfterDamageEffect, HealTargetEffect } from '../../../game/store/effects/attack-effects';
import { AttackEffect } from '../../../game/store/effects/game-effects';

export class Vaporeon extends PokemonCard {

  public id: number = 134;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Eevee';

  public cardType: CardType = CardType.WATER;

  public hp: number = 130;

  public weakness: Weakness[] = [{ type: CardType.LIGHTNING }];

  public resistance: Resistance[] = [];

  public retreat: CardType[] = [CardType.COLORLESS, CardType.COLORLESS];

  public powers: Power[] = [];

  public attacks: Attack[] = [{
    name: 'Spiral Drain',
    cost: [CardType.WATER],
    damage: 30,
    text: 'Heal 30 damage from this Pokémon.'
  }, {
    name: 'Fighting Whirlpool',
    cost: [CardType.WATER, CardType.COLORLESS, CardType.COLORLESS],
    damage: 90,
    text: 'If your opponent\'s Active Pokémon is a Pokémon ex or Pokémon V, this attack does 90 more damage.'
  }];

  public set: string = 'MEW';

  public name: string = 'Vaporeon';

  public fullName: string = 'Vaporeon MEW';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Sprial Drain
    if (effect instanceof AfterDamageEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      const healEffect = new HealTargetEffect(effect.attackEffect, 30);
      healEffect.target = player.active;
      return store.reduceEffect(state, healEffect);
    }

    // Fighting Whirlpool
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      const defending = opponent.active.getPokemonCard();
      if (defending && (defending.tags.includes(CardTag.EX) || defending.tags.includes(CardTag.V))) {
        effect.damage += 90;
      }
    }
    return state;
  }

}
