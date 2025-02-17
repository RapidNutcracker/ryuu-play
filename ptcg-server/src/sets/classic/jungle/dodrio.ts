import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, Attack, Power, PowerType } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { CheckRetreatCostEffect } from '../../../game/store/effects/check-effects';

export class Dodrio extends PokemonCard {

  public id: number = 34;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Doduo';

  public cardType: CardType = CardType.COLORLESS;

  public hp: number = 70;

  public weakness = [{ type: CardType.LIGHTNING }];

  public resistance = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [];

  public powers: Power[] = [{
    name: 'Retreat Aid',
    powerType: PowerType.POKEMON_POWER,
    text: 'As long as Dodrio is Benched, pay {C} less to retreat your Active Pokémon.'
  }];

  public attacks: Attack[] = [{
    name: 'Rage',
    cost: [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS],
    damage: 10,
    text: 'Does 10 damage plus 10 more damage for each damage counter on Dodrio.'
  }];

  public set: string = 'JU';

  public name: string = 'Dodrio';

  public fullName: string = 'Dodrio JU';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Retreat Aid
    if (effect instanceof CheckRetreatCostEffect && effect.player.bench.some(benchSlot => benchSlot.getPokemonCard() === this)) {
      const player = effect.player;
      const pokemonCard = player.active.getPokemonCard();

      if (pokemonCard) {
        const index = effect.cost.indexOf(CardType.COLORLESS);
        if (index !== -1) {
          effect.cost.splice(index, 1);
        }
      }
    }

    // Rage
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      effect.damage += effect.player.active.damage;
    }


    return state;
  }
}
