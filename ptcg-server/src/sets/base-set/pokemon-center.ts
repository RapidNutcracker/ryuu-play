import { TrainerCard } from '../../game/store/card/trainer-card';
import { TrainerType } from '../../game/store/card/card-types';
import { StoreLike } from '../../game/store/store-like';
import { State } from '../../game/store/state/state';
import { Effect } from '../../game/store/effects/effect';
import { TrainerEffect } from '../../game/store/effects/play-card-effects';
import {
  PlayerType,
  CardTarget,
  GameError,
  GameMessage,
  EnergyCard
} from '../../game';
import { HealEffect } from '../../game/store/effects/game-effects';

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;

  const blocked: CardTarget[] = [];
  let hasPokemonWithDamage: boolean = false;
  player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (cardList, card, target) => {
    if (cardList.damage === 0) {
      blocked.push(target);
    } else {
      hasPokemonWithDamage = true;
    }
  });

  if (hasPokemonWithDamage === false) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (cardList) => {

    if (cardList.damage > 0) {
      // Heal Pokémon
      const healEffect = new HealEffect(player, cardList, cardList.damage);
      store.reduceEffect(state, healEffect);

      // Discard its energy cards
      const cards = cardList.cards.filter(c => c instanceof EnergyCard);
      cardList.moveCardsTo(cards, player.discard);
    }
  });

  return state;
}

export class PokemonCenter extends TrainerCard {

  public trainerType: TrainerType = TrainerType.ITEM;

  public set: string = 'BS';

  public name: string = 'Pokémon Center';

  public fullName: string = 'Pokémon Center BS';

  public text: string =
    'Remove all damage counters from all of your own Pokémon with damage counters on them, ' +
    'then discard all Energy cards attached to those Pokémon.';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, effect);
      return generator.next().value;
    }
    return state;
  }

}
