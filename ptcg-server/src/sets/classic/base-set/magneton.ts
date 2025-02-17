import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, SpecialCondition } from '../../../game/store/card/card-types';
import { StoreLike, State, CoinFlipPrompt } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { GameMessage } from '../../../game/game-message';
import { AddSpecialConditionsEffect, DealDamageEffect, PutDamageEffect } from '../../../game/store/effects/attack-effects';

export class Magneton extends PokemonCard {

  public id: number = 9;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Magnemite';

  public cardType: CardType = CardType.LIGHTNING;

  public hp: number = 60;

  public weakness = [{ type: CardType.FIGHTING }];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: 'Thunder Wave',
      cost: [CardType.LIGHTNING, CardType.LIGHTNING, CardType.COLORLESS],
      damage: 30,
      text: 'Flip a coin. If heads, the Defending Pokémon is now Paralyzed.'
    },
    {
      name: 'Selfdestruct',
      cost: [CardType.LIGHTNING, CardType.LIGHTNING, CardType.COLORLESS, CardType.COLORLESS],
      damage: 80,
      text: 'Does 20 damage to each Pokémon on each player\'s Bench. (Don\'t apply Weakness and Resistance for Benched Pokémon.) Magneton does 80 damage to itself.'
    }
  ];

  public set: string = 'BS';

  public name: string = 'Magneton';

  public fullName: string = 'Magneton BS';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Thunder Wave
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], result => {
        if (result === true) {
          const specialConditionEffect = new AddSpecialConditionsEffect(effect, [SpecialCondition.PARALYZED]);
          store.reduceEffect(state, specialConditionEffect);
        }
      });
    }

    // Selfdestruct
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;
      const opponent = effect.opponent;

      const benched = player.bench.filter(b => b.cards.length > 0).concat(opponent.bench.filter(b => b.cards.length > 0));

      benched.forEach(target => {
        const damageEffect = new PutDamageEffect(effect, 20);
        damageEffect.target = target;
        store.reduceEffect(state, damageEffect);
      });

      const selfDamageEffect = new DealDamageEffect(effect, 80);
      selfDamageEffect.target = player.active;
      store.reduceEffect(state, selfDamageEffect);
    }

    return state;
  }

}
