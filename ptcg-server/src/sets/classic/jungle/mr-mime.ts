import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, PowerType } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { DealDamageEffect } from '../../../game/store/effects/attack-effects';

export class MrMime extends PokemonCard {

  public id: number = 6;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.PSYCHIC;

  public hp: number = 40;

  public weakness = [{ type: CardType.PSYCHIC }];

  public resistance = [];

  public retreat = [CardType.COLORLESS];

  public powers = [{
    name: 'Invisible Wall',
    powerType: PowerType.POKEMON_POWER,
    text:
      'Whenever an attack (including your own) does 30 or more damage to Mr. Mime ' +
      '(after applying Weakness and Resistance), prevent that damage. ' +
      '(Any other effects of attacks still happen.) ' +
      'This power can\'t be used if Mr. Mime is Asleep, Confused, or Paralyzed.'
  }];

  public attacks = [
    {
      name: 'Meditate',
      cost: [CardType.PSYCHIC, CardType.COLORLESS],
      damage: 10,
      text: 'Does 10 damage plus 10 more damage for each damage counter on the Defending Pokémon.'
    }
  ];

  public set: string = 'JU';

  public name: string = 'Mr. Mime';

  public fullName: string = 'Mr. Mime JU';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Invisible Wall
    if (effect instanceof DealDamageEffect && effect.target.cards.includes(this)) {
      if (effect.damage >= 30) {
        effect.damage = 0;
      }

      return state;
    }

    // Meditate
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      effect.damage += effect.opponent.active.damage;
      return state;
    }

    return state;
  }
}
