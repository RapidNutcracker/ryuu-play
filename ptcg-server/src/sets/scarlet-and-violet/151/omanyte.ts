import { AttackEffect } from '../../../game/store/effects/game-effects';
import { Effect } from '../../../game/store/effects/effect';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, SuperType } from '../../../game/store/card/card-types';
import {
  StoreLike,
  State,
  Resistance,
  Weakness,
  Attack,
  GameMessage,
  ChooseCardsPrompt,
  EnergyCard
} from '../../../game';

export class Omanyte extends PokemonCard {

  public id: number = 138;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Antique Helix Fossil';

  public cardTypes: CardType[] = [CardType.WATER];

  public hp: number = 100;

  public weakness: Weakness[] = [{ type: CardType.LIGHTNING }];

  public resistance: Resistance[] = [];

  public retreat: CardType[] = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks: Attack[] = [{
    name: 'Tentacular Return',
    cost: [CardType.WATER, CardType.WATER],
    damage: 50,
    text:
      'Put an Energy attached to your opponent\'s Active Pokémon into their hand.'
  }];

  public set: string = 'MEW';

  public name: string = 'Omanyte';

  public fullName: string = 'Omanyte MEW';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    // Tentacular Return
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = effect.opponent;

      // Defending Pokémon has no energy cards attached
      if (!opponent.active.cards.some(c => c instanceof EnergyCard)) {
        return state;
      }

      return store.prompt(state, new ChooseCardsPrompt(
        player.id,
        GameMessage.CHOOSE_CARD_TO_HAND,
        opponent.active,
        { superType: SuperType.ENERGY },
        { min: 1, max: 1, allowCancel: false }
      ), selected => {
        opponent.active.moveCardsTo(selected, opponent.hand);
      });
    }

    return state;
  }

}
