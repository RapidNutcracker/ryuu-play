import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, CardTag } from '../../../game/store/card/card-types';
import { StoreLike } from '../../../game/store/store-like';
import { State, GamePhase } from '../../../game/store/state/state';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect, PowerEffect } from '../../../game/store/effects/game-effects';
import { PutCountersEffect, PutDamageEffect } from '../../../game/store/effects/attack-effects';
import { PowerType } from '../../../game/store/card/pokemon-types';
import { StateUtils } from '../../../game/store/state-utils';

export class Mimikyu extends PokemonCard {

  public id: number = 97;

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.PSYCHIC];

  public hp: number = 70;

  public weakness = [{ type: CardType.METAL }];

  public retreat = [CardType.COLORLESS];

  public powers = [{
    name: 'Safeguard',
    powerType: PowerType.ABILITY,
    text: 'Prevent all damage done to this Pokémon by attacks from your opponent\'s Pokémon ex and Pokémon V.'
  }];

  public attacks = [{
    name: 'Ghost Eye',
    cost: [CardType.PSYCHIC, CardType.COLORLESS],
    damage: 0,
    text: 'Put 7 damage counters on your opponent\'s Active Pokémon.'
  }];

  public set: string = 'PAL';

  public name: string = 'Mimikyu';

  public fullName: string = 'Mimikyu PAL';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const putDamageCountersEffect = new PutCountersEffect(effect, 70);
      state = store.reduceEffect(state, putDamageCountersEffect);

      return state;
    }

    // Prevent damage from Pokémon ex and Pokémon V
    if (effect instanceof PutDamageEffect && effect.target.cards.includes(this)) {
      const pokemonCard = effect.target.getPokemonCard();
      const sourceCard = effect.source.getPokemonCard();

      // Card is not active, or damage source is unknown
      if (pokemonCard !== this || sourceCard === undefined) {
        return state;
      }

      // Do not ignore self-damage
      const player = StateUtils.findOwner(state, effect.target);
      const opponent = StateUtils.findOwner(state, effect.source);
      if (player === opponent) {
        return state;
      }

      // It's not an attack
      if (state.phase !== GamePhase.ATTACK) {
        return state;
      }

      if (sourceCard.tags.includes(CardTag.EX) || sourceCard.tags.includes(CardTag.V)) {
        // Try to reduce PowerEffect, to check if something is blocking our ability
        try {
          const powerEffect = new PowerEffect(player, this.powers[0], this);
          store.reduceEffect(state, powerEffect);
        } catch {
          return state;
        }

        effect.preventDefault = true;
      }
    }

    return state;
  }

}
