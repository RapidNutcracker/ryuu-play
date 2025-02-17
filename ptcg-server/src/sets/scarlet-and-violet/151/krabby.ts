import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, SuperType, EnergyType } from '../../../game/store/card/card-types';
import { StoreLike, State, Resistance, Weakness, Card, ChooseCardsPrompt, ShufflePrompt } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { GameMessage } from '../../../game/game-message';

function* useSaltWater(next: Function, store: StoreLike, state: State,
  effect: AttackEffect): IterableIterator<State> {
  const player = effect.player;

  if (player.deck.cards.length === 0) {
    return state;
  }

  let cards: Card[] = [];
  yield store.prompt(state, new ChooseCardsPrompt(
    player.id,
    GameMessage.CHOOSE_CARD_TO_HAND,
    player.deck,
    { superType: SuperType.ENERGY, energyType: EnergyType.BASIC, provides: [CardType.WATER] },
    { min: 1, max: 2, allowCancel: true }
  ), selected => {
    cards = selected || [];
    next();
  });

  player.deck.moveCardsTo(cards, player.active);

  return store.prompt(state, new ShufflePrompt(player.id), order => {
    player.deck.applyOrder(order);
  });
}


export class Krabby extends PokemonCard {

  public id: number = 98;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.WATER;

  public hp: number = 70;

  public weakness: Weakness[] = [{ type: CardType.LIGHTNING }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: 'Salt Water',
      cost: [CardType.WATER],
      damage: 0,
      text: 'Flip a coin. ' +
        'If heads, search your deck for up to 2 Basic {W} Energy cards and attach them to this Pokémon. ' +
        'Then, shuffle your deck.'
    },
    {
      name: 'Crab Hammer',
      cost: [CardType.WATER, CardType.WATER, CardType.WATER],
      damage: 50,
      text: ''
    },
  ];

  public set: string = 'MEW';

  public name: string = 'Krabby';

  public fullName: string = 'Krabby MEW';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Salt Water
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const generator = useSaltWater(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }

}
