import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, SuperType } from '../../../game/store/card/card-types';
import { StoreLike, State, Resistance, Weakness, ChooseCardsPrompt, GameMessage } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';

export class Golduck extends PokemonCard {

  public id: number = 55;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Psyduck'

  public cardType: CardType = CardType.WATER;

  public hp: number = 110;

  public weakness: Weakness[] = [{ type: CardType.LIGHTNING }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS];

  public attacks = [{
    name: 'Aquatic Rescue',
    cost: [CardType.COLORLESS],
    damage: 0,
    text: 'Put up to 4 Pokémon from your discard pile into your hand.'
  }, {
    name: 'Super Splash',
    cost: [CardType.WATER, CardType.WATER, CardType.COLORLESS],
    damage: 120,
    text: ''
  }];

  public set: string = 'MEW';

  public name: string = 'Golduck';

  public fullName: string = 'Golduck MEW';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Aquatic Rescue
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      const numberOfPokemonInDiscardPile = player.discard.cards.filter(c => {
        return c instanceof PokemonCard
      }).length;

      if (numberOfPokemonInDiscardPile === 0) {
        return state;
      }

      const max = Math.min(4, numberOfPokemonInDiscardPile);

      return store.prompt(state, [
        new ChooseCardsPrompt(
          player.id,
          GameMessage.CHOOSE_CARD_TO_HAND,
          player.discard,
          { superType: SuperType.POKEMON },
          { min: 0, max, allowCancel: true }
        )], selected => {
          const cards = selected || [];

          if (cards.length > 0) {
            player.discard.moveCardsTo(cards, player.hand);
          }
        });
    }

    return state;
  }
}
