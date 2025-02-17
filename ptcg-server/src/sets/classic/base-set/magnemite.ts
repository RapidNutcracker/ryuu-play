import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, SpecialCondition } from '../../../game/store/card/card-types';
import { StoreLike, State, CoinFlipPrompt } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { GameMessage } from '../../../game/game-message';
import { AddSpecialConditionsEffect, DealDamageEffect, PutDamageEffect } from '../../../game/store/effects/attack-effects';

export class Magnemite extends PokemonCard {

  public id: number = 53;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.LIGHTNING;

  public hp: number = 40;

  public weakness = [{ type: CardType.FIGHTING }];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: 'Thunder Wave',
      cost: [CardType.LIGHTNING],
      damage: 10,
      text: 'Flip a coin. If heads, the Defending Pokémon is now Paralyzed.'
    },
    {
      name: 'Selfdestruct',
      cost: [CardType.LIGHTNING, CardType.COLORLESS],
      damage: 40,
      text: 'Does 10 damage to each Pokémon on each player\'s Bench. (Don\'t apply Weakness and Resistance for Benched Pokémon.) Magnemite does 40 damage to itself.'
    }
  ];

  public set: string = 'BS';

  public name: string = 'Magnemite';

  public fullName: string = 'Magnemite BS';

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
        const damageEffect = new PutDamageEffect(effect, 10);
        damageEffect.target = target;
        store.reduceEffect(state, damageEffect);
      });

      const selfDamageEffect = new DealDamageEffect(effect, 40);
      selfDamageEffect.target = player.active;
      store.reduceEffect(state, selfDamageEffect);
    }

    return state;
  }

}
