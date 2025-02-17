import { AttackEffect } from '../../../game/store/effects/game-effects';
import { Card } from '../../../game/store/card/card';
import { ChooseCardsPrompt } from '../../../game/store/prompts/choose-cards-prompt';
import { Effect } from '../../../game/store/effects/effect';
import { GameMessage } from '../../../game/game-message';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Resistance, Weakness } from '../../../game/store/card/pokemon-types';
import { ShufflePrompt } from '../../../game/store/prompts/shuffle-prompt';
import { Stage, CardType, SuperType, TrainerType } from '../../../game/store/card/card-types';
import { State } from '../../../game/store/state/state';
import { StoreLike } from '../../../game/store/store-like';
import { ShowCardsPrompt } from '../../../game/store/prompts/show-cards-prompt';
import { CoinFlipPrompt } from '../../../game/store/prompts/coin-flip-prompt';

function* useLead(next: Function, store: StoreLike, state: State, effect: AttackEffect): IterableIterator<State> {
  const player = effect.player;
  const opponent = effect.opponent;

  if (player.deck.cards.length === 0) {
    return state;
  }

  let cards: Card[] = [];
  yield store.prompt(state, new ChooseCardsPrompt(
    player.id,
    GameMessage.CHOOSE_CARD_TO_HAND,
    player.deck,
    { superType: SuperType.TRAINER, trainerType: TrainerType.SUPPORTER },
    { min: 1, max: 1, allowCancel: true }
  ), selected => {
    cards = selected || [];
    next();
  });

  if (cards.length > 0) {
    yield store.prompt(state, new ShowCardsPrompt(
      opponent.id,
      GameMessage.CARDS_SHOWED_BY_THE_OPPONENT,
      cards
    ), () => next());

    player.deck.moveCardsTo(cards, player.hand);
  }

  return store.prompt(state, new ShufflePrompt(player.id), order => {
    player.deck.applyOrder(order);
  });
}

export class Jigglypuff extends PokemonCard {

  public id: number = 39;

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.COLORLESS];

  public hp: number = 70;

  public weakness: Weakness[] = [{ type: CardType.FIGHTING }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS];

  public attacks = [{
    name: 'Lead',
    cost: [CardType.COLORLESS],
    damage: 0,
    text:
      'Search your deck for a Supporter card, reveal it, and put it into your hand. Then, shuffle your deck.'
  },
  {
    name: 'Stompy Stomp',
    cost: [CardType.COLORLESS, CardType.COLORLESS],
    damage: 20,
    text: 'Flip 2 coins. This attack does 20 damage for each heads.'
  }];

  public set: string = 'MEW';

  public name: string = 'Jigglypuff';

  public fullName: string = 'Jigglypuff MEW';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Lead
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const generator = useLead(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    // Stompy Stomp
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;
      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP),
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP),
      ], results => {
        let heads: number = 0;
        results.forEach(r => { heads += r ? 1 : 0; });
        effect.damage = 20 * heads;
      });
    }

    return state;
  }
}
