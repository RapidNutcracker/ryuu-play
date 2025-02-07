import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType, SuperType, EnergyType } from '../../game/store/card/card-types';
import { StoreLike, State, StateUtils, ChooseCardsPrompt, ShufflePrompt } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect } from '../../game/store/effects/game-effects';
import { GameMessage } from '../../game/game-message';


function* useCharge(self: Pikachu, next: Function, store: StoreLike, state: State, effect: AttackEffect): IterableIterator<State> {
  const player = effect.player;

  // Is this necessary? Why not just assume player.active?
  const cardList = StateUtils.findCardList(state, self);
  if (cardList === undefined) {
    return state;
  }

  yield store.prompt(state, new ChooseCardsPrompt(
    player.id,
    GameMessage.CHOOSE_CARD_TO_ATTACH,
    player.deck,
    { superType: SuperType.ENERGY, energyType: EnergyType.BASIC, provides: [CardType.LIGHTNING] },
    { min: 1, max: 1, allowCancel: true }
  ), cards => {
    cards = cards || [];
    if (cards.length > 0) {
      player.deck.moveCardsTo(cards, cardList);
    }
    next();
  });

  return store.prompt(state, new ShufflePrompt(player.id), order => {
    player.deck.applyOrder(order);
  });
}

export class Pikachu extends PokemonCard {

  public id: number = 25;

  public tags: string[] = [];

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.LIGHTNING;

  public hp: number = 60;

  public weakness = [{ type: CardType.FIGHTING }];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: 'Charge',
      cost: [CardType.LIGHTNING],
      damage: 0,
      text: 'Search your deck for a Basic {L} Energy card and attach it to this Pokémon. Then, shuffle your deck.'
    },
    {
      name: 'Pika Punch',
      cost: [CardType.LIGHTNING, CardType.LIGHTNING, CardType.COLORLESS],
      damage: 50,
      text: ''
    }
  ];

  public set: string = 'MEW';

  public name: string = 'Pikachu';

  public fullName: string = 'Pikachu MEW';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    // Charge
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const generator = useCharge(this, () => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}
