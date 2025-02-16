import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';
import { StoreLike, State, CoinFlipPrompt, GameMessage, ConfirmPrompt, Card, ChooseCardsPrompt, StateUtils } from '../../game';
import { AttackEffect } from '../../game/store/effects/game-effects';
import { Effect } from '../../game/store/effects/effect';
import { DiscardCardsEffect } from '../../game/store/effects/attack-effects';
import { CheckProvidedEnergyEffect } from '../../game/store/effects/check-effects';

function* useWildfire(next: Function, store: StoreLike, state: State, self: Moltres, effect: AttackEffect): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);

  let wantsToDiscardEnergy: boolean = false;
  yield store.prompt(state, new ConfirmPrompt(
    effect.player.id,
    GameMessage.WANT_TO_DISCARD_ENERGY
  ), result => {
    wantsToDiscardEnergy = result;
    next();
  });

  if (!wantsToDiscardEnergy) {
    return state;
  }

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

  opponent.deck.moveTo(opponent.discard, discardedCards.length);

  return state;
}

export class Moltres extends PokemonCard {

  public id: number = 12;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.FIRE;

  public hp: number = 70;

  public weakness = [];

  public resistance = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [{
    name: 'Wildfire',
    cost: [CardType.FIRE],
    damage: 0,
    text:
      'You may discard any number of {R} Energy cards attached to Moltres when you use this attack. ' +
      'If you do, discard that many cards from the top of your opponent\'s deck.'
  }, {
    name: 'Dive Bomb',
    cost: [CardType.FIRE, CardType.FIRE, CardType.FIRE, CardType.FIRE],
    damage: 80,
    text: 'Flip a coin. If tails, this attack does nothing.'
  }];

  public set: string = 'FO';

  public name: string = 'Moltres';

  public fullName: string = 'Moltres FO';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const generator = useWildfire(() => generator.next(), store, state, this, effect);
      return generator.next().value;
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;

      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], result => {
        if (result === false) {
          effect.preventDefault = true;
        }
      });
    }

    return state;
  }

}
