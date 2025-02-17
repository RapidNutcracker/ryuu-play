import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, Resistance, Weakness, CardList } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';

export class Onix extends PokemonCard {

  public id: number = 95;

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.FIGHTING];

  public hp: number = 120;

  public weakness: Weakness[] = [{ type: CardType.GRASS }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [{
    name: 'Thumpalanche',
    cost: [CardType.COLORLESS, CardType.COLORLESS],
    damage: 0,
    text: 'Discard the top 5 cards of your deck. This attack does 80 damage for each Pokémon with a Retreat Cost of exactly 4 that you discarded in this way.'
  }, {
    name: 'Heavy Impact',
    cost: [CardType.FIGHTING, CardType.FIGHTING, CardType.COLORLESS, CardType.COLORLESS],
    damage: 100,
    text: ''
  }];

  public set: string = 'MEW';

  public name: string = 'Onix';

  public fullName: string = 'Onix MEW';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Thumpalanche
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      const top5Cards = new CardList();
      player.deck.moveTo(top5Cards, 5);

      const fourCostRetreatCards = top5Cards.cards.filter(c => c instanceof PokemonCard && c.retreat.length === 4).length;
      effect.damage = 80 * fourCostRetreatCards;

      top5Cards.moveTo(player.discard);

      return state;
    }

    return state;
  }

}
