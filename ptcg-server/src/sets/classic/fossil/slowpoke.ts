import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, SuperType } from '../../../game/store/card/card-types';
import { StoreLike, State, GameError, GameMessage, ChooseEnergyPrompt, Card, ChooseCardsPrompt } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect, UseAttackEffect } from '../../../game/store/effects/game-effects';
import { DiscardCardsEffect } from '../../../game/store/effects/attack-effects';
import { CheckProvidedEnergyEffect } from '../../../game/store/effects/check-effects';


function* useScavenge(next: Function, store: StoreLike, state: State, effect: AttackEffect): IterableIterator<State> {
  const player = effect.player;

  const checkProvidedEnergy = new CheckProvidedEnergyEffect(player);
  state = store.reduceEffect(state, checkProvidedEnergy);

  if (player.discard.cards.length === 0) {
    return state;
  }

  yield store.prompt(state, new ChooseEnergyPrompt(
    player.id,
    GameMessage.CHOOSE_ENERGIES_TO_DISCARD,
    checkProvidedEnergy.energyMap,
    [CardType.FIRE],
    { allowCancel: false }
  ), energy => {
    const cards: Card[] = (energy || []).map(e => e.card);

    const discardEnergy = new DiscardCardsEffect(effect, cards);
    discardEnergy.target = player.active;

    store.reduceEffect(state, discardEnergy);

    next();
  });

  let cards: Card[] = [];
  yield store.prompt(state, new ChooseCardsPrompt(
    player.id,
    GameMessage.CHOOSE_CARD_TO_HAND,
    player.discard,
    { superType: SuperType.TRAINER },
    { min: 1, max: 1, allowCancel: false }
  ), selected => {
    cards = selected || [];
    next();
  });

  player.discard.moveCardsTo(cards, player.hand);

  return state;
}

export class Slowpoke extends PokemonCard {

  public id: number = 55;

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.PSYCHIC];

  public hp: number = 50;

  public weakness = [{ type: CardType.PSYCHIC }];

  public retreat = [CardType.COLORLESS];

  public attacks = [{
    name: 'Spacing Out',
    cost: [CardType.COLORLESS],
    damage: 0,
    text:
      'Flip a coin. If heads, remove a damage counter from Slowpoke. ' +
      'This attack can\'t be used if Slowpoke has no damage counters on it.'
  }, {
    name: 'Scavenge',
    cost: [CardType.PSYCHIC, CardType.PSYCHIC],
    damage: 0,
    text:
      'Discard 1 {P} Energy card attached to Slowpoke in order to use this attack. ' +
      'Put a Trainer card from your discard pile into your hand.'
  }];

  public set: string = 'FO';

  public name: string = 'Slowpoke';

  public fullName: string = 'Slowpoke FO';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Spacing Out
    if (effect instanceof UseAttackEffect && effect.attack === this.attacks[0]) {
      if (effect.player.active.damage === 0) {
        throw new GameError(GameMessage.CANNOT_USE_ATTACK);
      }
    }

    // Scavenge
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const generator = useScavenge(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}
