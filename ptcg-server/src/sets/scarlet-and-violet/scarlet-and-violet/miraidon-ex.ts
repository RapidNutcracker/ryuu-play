import { Card, ChooseCardsPrompt, GameError, PokemonCardList, Power, PowerType, ShufflePrompt } from '../../../game';
import { AttackEffect, PowerEffect, UseAttackEffect } from '../../../game/store/effects/game-effects';
import { Effect } from '../../../game/store/effects/effect';
import { GameMessage } from '../../../game/game-message';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, CardTag, SuperType } from '../../../game/store/card/card-types';
import { State } from '../../../game/store/state/state';
import { StoreLike } from '../../../game/store/store-like';

function* useTandemUnit(next: Function, store: StoreLike, state: State, self: MiraidonEx, effect: PowerEffect): IterableIterator<State> {
  const player = effect.player;
  const slots: PokemonCardList[] = player.bench.filter(b => b.cards.length === 0);
  const max = Math.min(slots.length, 2);

  if (slots.length === 0 || effect.player.deck.cards.length === 0) {
    throw new GameError(GameMessage.CANNOT_USE_ATTACK);
  }

  if (self.tandemUnitUsedTurn === state.turn) {
    throw new GameError(GameMessage.POWER_ALREADY_USED);
  }

  let cards: Card[] = [];
  yield store.prompt(state, new ChooseCardsPrompt(
    player.id,
    GameMessage.CHOOSE_CARD_TO_PUT_ONTO_BENCH,
    player.deck,
    { superType: SuperType.POKEMON, stage: Stage.BASIC, cardType: CardType.LIGHTNING },
    { min: 0, max, allowCancel: true }
  ), selected => {
    cards = selected || [];
    next();
  });

  if (cards.length > slots.length) {
    cards.length = slots.length;
  }

  cards.forEach((card, index) => {
    player.deck.moveCardTo(card, slots[index]);
    slots[index].pokemonPlayedTurn = state.turn;
  });

  self.tandemUnitUsedTurn = state.turn;

  return store.prompt(state, new ShufflePrompt(player.id), order => {
    player.deck.applyOrder(order);
  });
}

export class MiraidonEx extends PokemonCard {

  public id: number = 81;

  public tags: string[] = [CardTag.EX];

  public stage: Stage = Stage.BASIC

  public cardType: CardType = CardType.LIGHTNING;

  public hp: number = 220;

  public weakness = [{ type: CardType.FIGHTING }];

  public resistance = [];

  public retreat = [CardType.COLORLESS];

  public powers: Power[] = [{
    name: 'Tandem Unit',
    powerType: PowerType.ABILITY,
    useWhenInPlay: true,
    text:
      'Once during your turn, ' +
      'you may search your deck for up to 2 Basic {L} Pokémon ' +
      'and put them onto your Bench. ' +
      'Then, shuffle your deck.'
  }];

  public attacks = [{
    name: 'Photon Blaster',
    cost: [CardType.LIGHTNING, CardType.LIGHTNING, CardType.COLORLESS],
    damage: 220,
    text: 'During your next turn, this Pokémon can\'t attack.'
  }];

  public set: string = 'SVI';

  public name: string = 'Miraidon ex';

  public fullName: string = 'Miraidon ex SVI';

  public rules: string[] = [
    'When your Pokémon ex is Knocked Out, your opponent takes 2 Prize cards.',
  ]

  public tandemUnitUsedTurn: number = -1;

  private photonBlasterUsedTurn: number = -1;


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    // Tandem Unit
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const generator = useTandemUnit(() => generator.next(), store, state, this, effect);
      return generator.next().value;
    }

    // Photon Blaster
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      this.photonBlasterUsedTurn = state.turn;
    }

    // Used Photon Blaster last turn
    if (effect instanceof UseAttackEffect && effect.card === this) {
      if (this.photonBlasterUsedTurn === state.turn - 2) {
        throw new GameError(GameMessage.CANNOT_USE_ATTACK);
      }
    }

    return state;
  }
}
