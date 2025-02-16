import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType, CardTag, SuperType, EnergyType } from '../../game/store/card/card-types';
import { StoreLike } from '../../game/store/store-like';
import { State } from '../../game/store/state/state';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect, UseAttackEffect } from '../../game/store/effects/game-effects';
import { Card, ChooseCardsPrompt, GameMessage, ShufflePrompt, StateUtils } from '../../game';
import { CheckProvidedEnergyEffect } from '../../game/store/effects/check-effects';
import { DiscardCardsEffect } from '../../game/store/effects/attack-effects';

function* useDynamicSpark(next: Function, store: StoreLike, state: State, effect: AttackEffect): IterableIterator<State> {
  const player = effect.player;

  const checkProvidedEnergy = new CheckProvidedEnergyEffect(player);
  store.reduceEffect(state, checkProvidedEnergy);

  const blocked: Card[] = [];
  checkProvidedEnergy.energyMap.forEach(em => {
    if (!(em.provides.includes(CardType.FIRE) || em.provides.includes(CardType.ANY))) {
      blocked.push(em.card);
    }
  });

  let discardedCards: Card[] = []
  yield store.prompt(state, new ChooseCardsPrompt(
    player.id,
    GameMessage.CHOOSE_ENERGIES_TO_DISCARD,
    player.active,
    {},
    { allowCancel: false }
  ), selected => {
    discardedCards = selected || [];
    next();
  });

  if (discardedCards.length === 0) {
    return state;
  }

  const discardEnergy = new DiscardCardsEffect(effect, discardedCards);
  discardEnergy.target = player.active;
  state = store.reduceEffect(state, discardEnergy);

  effect.damage = 60 * discardedCards.length;

  return state;
}


export class RaichuV extends PokemonCard {

  public id: number = 45;

  public tags: string[] = [CardTag.V];

  public stage: Stage = Stage.BASIC

  public cardType: CardType = CardType.LIGHTNING;

  public hp: number = 200;

  public weakness = [{ type: CardType.FIGHTING }];

  public retreat = [CardType.COLORLESS];

  public attacks = [{
    name: 'Fast Charge',
    cost: [CardType.LIGHTNING],
    damage: 0,
    text:
      'If you go first, you can use this attack during your first turn. ' +
      'Search your deck for a {L} Energy card and attach it to this Pokémon. ' +
      'Then, shuffle your deck.'
  }, {
    name: 'Dynamic Spark',
    cost: [CardType.LIGHTNING, CardType.LIGHTNING],
    damage: 60,
    text:
      'You may discard any amount of {L} Energy from your Pokémon. ' +
      'This attack does 60 damage for each card you discarded in this way.'
  }];

  public set: string = 'BRS';

  public name: string = 'Raichu V';

  public fullName: string = 'Raichu V BRS';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Fast Charge First Turn
    if (effect instanceof UseAttackEffect && effect.attack === this.attacks[0] && state.turn === 1) {
      state.rules.firstTurnAttack = true;
      return state;
    }

    // Fast Charge
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      const cardList = StateUtils.findCardList(state, this);
      if (cardList === undefined) {
        return state;
      }

      return store.prompt(state, new ChooseCardsPrompt(
        player.id,
        GameMessage.CHOOSE_CARD_TO_ATTACH,
        player.deck,
        { superType: SuperType.ENERGY, energyType: EnergyType.BASIC, name: 'Lightning Energy' },
        { min: 1, max: 1, allowCancel: true }
      ), cards => {
        cards = cards || [];
        if (cards.length > 0) {
          player.deck.moveCardsTo(cards, cardList);
        }

        return store.prompt(state, new ShufflePrompt(player.id), order => {
          player.deck.applyOrder(order);
        });
      });
    }

    // Dynamic Spark
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const generator = useDynamicSpark(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }

}
