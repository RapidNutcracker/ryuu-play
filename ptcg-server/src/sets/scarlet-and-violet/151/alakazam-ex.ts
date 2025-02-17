import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, CardTag } from '../../../game/store/card/card-types';
import { StoreLike, State, Attack } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';


export class AlakazamEx extends PokemonCard {

  public id: number = 65;

  public tags: string[] = [CardTag.EX];

  public stage: Stage = Stage.STAGE_2;

  public evolvesFrom = 'Kadabra';

  public cardType: CardType = CardType.PSYCHIC;

  public hp: number = 310;

  public weakness = [{ type: CardType.DARKNESS }];

  public resistance = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [CardType.COLORLESS];

  public attacks: Attack[] = [{
    name: 'Mind Jack',
    cost: [CardType.COLORLESS, CardType.COLORLESS],
    damage: 30,
    text: 'This attack does 30 more damage for each of your opponent\'s Benched Pokémon.'
  }, {
    name: 'Dimensional Hand',
    cost: [CardType.PSYCHIC, CardType.PSYCHIC],
    damage: 120,
    useFromBench: true,
    text: 'This attack can be used even if this Pokémon is on the Bench.'
  }];

  public set: string = 'MEW';

  public name: string = 'Alakazam ex';

  public fullName: string = 'Alakazam ex MEW';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    // Mind Jack
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const opponent = effect.opponent;
      const opponentBenchedPokemonCount: number = opponent.bench.filter(b => b.cards.length > 0).length;
      effect.damage += opponentBenchedPokemonCount * 30;

      return state;
    }

    return state;
  }
}
