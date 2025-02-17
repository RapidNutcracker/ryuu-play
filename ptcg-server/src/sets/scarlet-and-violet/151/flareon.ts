import { AttackEffect } from '../../../game/store/effects/game-effects';
import { DiscardCardsEffect } from '../../../game/store/effects/attack-effects';
import { Effect } from '../../../game/store/effects/effect';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, CardTag, SuperType } from '../../../game/store/card/card-types';
import {
  StoreLike,
  State,
  Resistance,
  Weakness,
  Attack,
  Power,
  StateUtils,
  GameMessage,
  EnergyCard,
  CoinFlipPrompt,
  Card,
  ChooseCardsPrompt
} from '../../../game';

function* useDestructiveFlame(next: Function, store: StoreLike, state: State,
  effect: AttackEffect): IterableIterator<State> {

  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);

  // Defending Pokémon has no energy cards attached
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

export class Flareon extends PokemonCard {

  public id: number = 136;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Eevee';

  public cardTypes: CardType[] = [CardType.FIRE];

  public hp: number = 130;

  public weakness: Weakness[] = [{ type: CardType.WATER }];

  public resistance: Resistance[] = [];

  public retreat: CardType[] = [CardType.COLORLESS, CardType.COLORLESS];

  public powers: Power[] = [];

  public attacks: Attack[] = [{
    name: 'Destructive Flame',
    cost: [CardType.FIRE],
    damage: 30,
    text:
      'Flip a coin. If heads, discard an Energy from your opponent\'s Active Pokémon.'
  }, {
    name: 'Fighting Blaze',
    cost: [CardType.FIRE, CardType.COLORLESS, CardType.COLORLESS],
    damage: 90,
    text: 'If your opponent\'s Active Pokémon is a Pokémon ex or Pokémon V, this attack does 90 more damage.'
  }];

  public set: string = 'MEW';

  public name: string = 'Flareon';

  public fullName: string = 'Flareon MEW';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Destructive Flame
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const generator = useDestructiveFlame(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    // Fighting Blaze
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      const defending = opponent.active.getPokemonCard();
      if (defending && (defending.tags.includes(CardTag.EX) || defending.tags.includes(CardTag.V))) {
        effect.damage += 90;
      }
    }
    return state;
  }

}
