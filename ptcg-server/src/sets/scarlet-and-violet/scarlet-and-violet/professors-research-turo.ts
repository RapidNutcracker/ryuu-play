import { TrainerCard } from '../../../game/store/card/trainer-card';
import { TrainerType } from '../../../game/store/card/card-types';
import { StoreLike } from '../../../game/store/store-like';
import { State } from '../../../game/store/state/state';
import { Effect } from '../../../game/store/effects/effect';
import { TrainerEffect } from '../../../game/store/effects/play-card-effects';
import { GameError, GameMessage } from '../../../game';


export class ProfessorsResearchTuro extends TrainerCard {

  public id: number = 190;

  public trainerType: TrainerType = TrainerType.SUPPORTER;

  public tags = [];

  public set: string = 'SVI';

  public name: string = 'Professor\'s Research';

  public fullName: string = 'Professor\'s Research (Turo) SVI';

  public text: string = 'Discard your hand and draw 7 cards.';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const player = effect.player;

      if (player.deck.cards.length === 0) {
        throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
      }

      const cards = player.hand.cards.filter(c => c !== this);
      player.hand.moveCardsTo(cards, player.discard);
      player.deck.moveTo(player.hand, 7);

      player.supporter.moveCardTo(effect.trainerCard, player.discard);
    }

    return state;
  }

}
