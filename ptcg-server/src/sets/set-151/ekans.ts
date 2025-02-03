import { AttackEffect } from '../../game/store/effects/game-effects';
import {
  Card,
  ChooseCardsPrompt,
  CoinFlipPrompt,
  EnergyCard,
  GameMessage,
  Power,
  Resistance,
  State,
  StateUtils,
  StoreLike,
  Weakness
} from '../../game';
import { DiscardCardsEffect } from '../../game/store/effects/attack-effects';
import { Effect } from '../../game/store/effects/effect';
import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType, SuperType } from '../../game/store/card/card-types';

function* useAcidSpray(next: Function, store: StoreLike, state: State,
  effect: AttackEffect): IterableIterator<State> {

  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);

  // Defending Pokemon has no energy cards attached
  if (!opponent.active.cards.some(c => c instanceof EnergyCard)) {
    return state;
  }

  let flipResult = false;
  yield store.prompt(state, new CoinFlipPrompt(
    player.id, GameMessage.COIN_FLIP
  ), result => {
    flipResult = result;
    next();
  });

  if (!flipResult) {
    return state;
  }

  let cards: Card[] = [];
  yield store.prompt(state, new ChooseCardsPrompt(
    player.id,
    GameMessage.CHOOSE_CARD_TO_DISCARD,
    opponent.active,
    { superType: SuperType.ENERGY },
    { min: 1, max: 1, allowCancel: false }
  ), selected => {
    cards = selected || [];
    next();
  });

  const discardEnergy = new DiscardCardsEffect(effect, cards);
  return store.reduceEffect(state, discardEnergy);
}

export class Ekans extends PokemonCard {

  public id: number = 23;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.DARK;

  public hp: number = 70;

  public weakness: Weakness[] = [{ type: CardType.FIGHTING }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public powers: Power[] = [];

  public attacks = [{
    name: 'Acid Spray',
    cost: [CardType.DARK, CardType.DARK],
    damage: 30,
    text: 'Flip a coin. If heads, discard an Energy from your opponent\'s Active Pokémon.'
  }];

  public set: string = 'MEW';

  public name: string = 'Ekans';

  public fullName: string = 'Ekans MEW';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Acid Spray
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const generator = useAcidSpray(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }

}
