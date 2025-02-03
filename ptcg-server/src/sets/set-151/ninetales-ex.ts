import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType, CardTag, SpecialCondition } from '../../game/store/card/card-types';
import { StoreLike, State } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect } from '../../game/store/effects/game-effects';
import { AddSpecialConditionsEffect } from '../../game/store/effects/attack-effects';

export class NinetalesEX extends PokemonCard {

  public id: number = 38;

  public tags: string[] = [CardTag.POKEMON_EX];

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Vulpix';

  public cardType: CardType = CardType.FIRE;

  public hp: number = 260;

  public weakness = [{ type: CardType.WATER }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [{
    name: 'Heat Wave',
    cost: [CardType.FIRE],
    damage: 30,
    text: 'Your opponent\'s Active Pokémon is now Burned.'
  }, {
    name: 'Mirrored Flames',
    cost: [CardType.FIRE, CardType.COLORLESS],
    damage: 80,
    text: 'If you have the same number of cards in your hand as your opponent, this attack does 140 more damage.'
  }];

  public set: string = 'MEW';

  public name: string = 'Ninetales EX';

  public fullName: string = 'Ninetales EX MEW';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Heat Wave
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const specialConditionEffect = new AddSpecialConditionsEffect(effect, [SpecialCondition.BURNED]);
      store.reduceEffect(state, specialConditionEffect);
    }

    // Mirrored Flames
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;
      const opponent = effect.opponent;

      if (player.hand.cards.length === opponent.hand.cards.length) {
        effect.damage += 140;
      }
    }

    return state;
  }

}
