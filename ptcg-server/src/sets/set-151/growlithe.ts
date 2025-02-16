import { AttackEffect } from '../../game/store/effects/game-effects';
import { Card } from '../../game/store/card/card';
import { ChooseCardsPrompt } from '../../game/store/prompts/choose-cards-prompt';
import { Effect } from '../../game/store/effects/effect';
import { GameMessage } from '../../game/game-message';
import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType, SuperType, EnergyType } from '../../game/store/card/card-types';
import { State } from '../../game/store/state/state';
import { StoreLike } from '../../game/store/store-like';
import { StateUtils } from '../../game/store/state-utils';
import { EnergyCard } from '../../game/store/card/energy-card';
import { DiscardCardsEffect } from '../../game/store/effects/attack-effects';

function* useVaporize(next: Function, store: StoreLike, state: State,
  effect: AttackEffect): IterableIterator<State> {

  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);

  // Defending Pokémon has no water energy cards attached
  if (!opponent.active.cards.some(c =>
    c instanceof EnergyCard &&
    c.energyType === EnergyType.BASIC &&
    c.provides.includes(CardType.WATER))) {
    return state;
  }

  let cards: Card[] = [];
  yield store.prompt(state, new ChooseCardsPrompt(
    player.id,
    GameMessage.CHOOSE_CARD_TO_DISCARD,
    opponent.active,
    { superType: SuperType.ENERGY, energyType: EnergyType.BASIC, provides: [CardType.WATER] },
    { min: 1, max: 1, allowCancel: false }
  ), selected => {
    cards = selected || [];
    next();
  });

  const discardEnergy = new DiscardCardsEffect(effect, cards);
  return store.reduceEffect(state, discardEnergy);
}

export class Growlithe extends PokemonCard {

  public id: number = 58;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.FIRE;

  public hp: number = 80;

  public weakness = [{ type: CardType.WATER }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [{
    name: 'Vaporize',
    cost: [CardType.FIRE],
    damage: 10,
    text: 'Discard a {W} Energy from your opponent\'s Active Pokémon.'
  }];

  public set: string = 'MEW';

  public name: string = 'Growlithe';

  public fullName: string = 'Growlithe MEW';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Vaporize
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const generator = useVaporize(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }

}
