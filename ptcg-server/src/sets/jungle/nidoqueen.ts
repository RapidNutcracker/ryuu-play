import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';
import { StoreLike, State } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect } from '../../game/store/effects/game-effects';

export class Nidoqueen extends PokemonCard {

  public id: number = 7;

  public stage: Stage = Stage.STAGE_2;

  public cardType: CardType = CardType.GRASS;

  public hp: number = 90;

  public weakness = [{ type: CardType.PSYCHIC }];

  public resistance = [];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public powers = [];

  public attacks = [
    {
      name: 'Boyfriends',
      cost: [CardType.GRASS, CardType.COLORLESS],
      damage: 20,
      text: 'Does 20 damage plus 20 more damage for each Nidoking you have in play.'
    },
    {
      name: 'Mega Punch',
      cost: [CardType.GRASS, CardType.GRASS, CardType.COLORLESS, CardType.COLORLESS],
      damage: 50,
      text: ''
    },
  ];

  public set: string = 'JU';

  public name: string = 'Nidoqueen';

  public fullName: string = 'Nidoqueen JU';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Boyfriends
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      const numberOfNidokingOnBench = player.bench.filter(benchSlot =>
        benchSlot.cards.length > 0 && benchSlot.getPokemonCard()?.name === 'Nidoking'
      ).length;

      effect.damage += numberOfNidokingOnBench * 20;
    }

    return state;
  }
}
