import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, TrainerType, SuperType } from '../../../game/store/card/card-types';
import { StoreLike, State, TrainerCard, ChooseCardsPrompt } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { GameMessage } from '../../../game/game-message';

export class Magneton extends PokemonCard {

  public id: number = 82;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Magnemite';

  public cardType: CardType = CardType.LIGHTNING;

  public hp: number = 60;

  public weakness = [{ type: CardType.FIGHTING }];

  public retreat = [CardType.COLORLESS];

  public attacks = [{
    name: 'Junk Magnet',
    cost: [CardType.LIGHTNING],
    damage: 0,
    text: 'Put up to 2 Item cards from your discard pile into your hand.'
  }, {
    name: 'Head Bolt',
    cost: [CardType.LIGHTNING, CardType.COLORLESS, CardType.COLORLESS],
    damage: 60,
    text: ''
  }];

  public set: string = 'MEW';

  public name: string = 'Magneton';

  public fullName: string = 'Magneton MEW';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Junk Magnet
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      const numerOfItemCardsInDiscardPile = player.discard.cards.filter(c => {
        return c instanceof TrainerCard && c.trainerType === TrainerType.ITEM
      }).length;

      if (numerOfItemCardsInDiscardPile === 0) {
        return state;
      }

      const max = Math.min(2, numerOfItemCardsInDiscardPile);

      return store.prompt(state, [
        new ChooseCardsPrompt(
          player.id,
          GameMessage.CHOOSE_CARD_TO_HAND,
          player.discard,
          { superType: SuperType.TRAINER, trainerType: TrainerType.ITEM },
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
