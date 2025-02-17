import { AttackEffect } from '../../../game/store/effects/game-effects';
import { Effect } from '../../../game/store/effects/effect';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, Attack } from '../../../game';

export class Machoke extends PokemonCard {

  public id: number = 67;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Machop';

  public cardType: CardType = CardType.FIGHTING;

  public hp: number = 100;

  public weakness = [{ type: CardType.PSYCHIC }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks: Attack[] = [{
    name: 'Mountain Ramming',
    cost: [CardType.FIGHTING, CardType.FIGHTING],
    damage: 50,
    text: 'Discard the top card of your opponent\'s deck.'
  }];

  public set: string = 'MEW';

  public name: string = 'Machoke';

  public fullName: string = 'Machoke MEW';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const opponent = effect.opponent;
      opponent.deck.moveTo(opponent.discard, 1);
      return state;
    }

    return state;
  }
}
