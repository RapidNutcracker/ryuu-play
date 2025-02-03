import { Effect } from '../../game/store/effects/effect';
import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Power, PowerType, Resistance } from '../../game/store/card/pokemon-types';
import { Stage, CardType, EnergyType, SuperType } from '../../game/store/card/card-types';
import { State } from '../../game/store/state/state';
import { StoreLike } from '../../game/store/store-like';
import { GameMessage } from '../../game/game-message';
import { ConfirmPrompt } from '../../game/store/prompts/confirm-prompt';
import { AttachEnergyEffect, PlayPokemonEffect } from '../../game/store/effects/play-card-effects';
import { PowerEffect } from '../../game/store/effects/game-effects';
import { CardList } from '../../game/store/state/card-list';
import { EnergyCard } from '../../game/store/card/energy-card';
import { AttachEnergyPrompt } from '../../game/store/prompts/attach-energy-prompt';
import { PlayerType, SlotType } from '../../game/store/actions/play-card-action';
import { StateUtils } from '../../game/store/state-utils';
import { ShowCardsPrompt, ShuffleDeckPrompt } from '../../game';


function* useSemiBloomingEnergy(next: Function, store: StoreLike, state: State,
  self: Gloom, effect: PlayPokemonEffect): IterableIterator<State> {
  const player = effect.player;

  if (player.deck.cards.length === 0) {
    return state;
  }

  let wantToUse = false;
  yield store.prompt(state, new ConfirmPrompt(
    effect.player.id,
    GameMessage.WANT_TO_USE_ABILITY
  ), result => {
    wantToUse = result;
    next();
  });

  if (!wantToUse) {
    return state;
  }

  // Try to reduce PowerEffect, to check if something is blocking our ability
  try {
    const powerEffect = new PowerEffect(player, self.powers[0], self);
    store.reduceEffect(state, powerEffect);
  } catch {
    return state;
  }

  const deckTop = new CardList();
  player.deck.moveTo(deckTop, 3);

  const hasBasicEnergyInDeckTop = deckTop.cards.some(c => {
    return c instanceof EnergyCard && c.energyType === EnergyType.BASIC;
  });

  if (hasBasicEnergyInDeckTop) {
    yield store.prompt(state, new AttachEnergyPrompt(
      player.id,
      GameMessage.ATTACH_ENERGY_CARDS,
      deckTop,
      PlayerType.BOTTOM_PLAYER,
      [SlotType.ACTIVE, SlotType.BENCH],
      { superType: SuperType.ENERGY, energyType: EnergyType.BASIC },
      { allowCancel: true }
    ), transfers => {
      transfers = transfers || [];
      for (const transfer of transfers) {
        const target = StateUtils.getTarget(state, player, transfer.to);
        const energyCard = transfer.card as EnergyCard;
        const attachEnergyEffect = new AttachEnergyEffect(player, energyCard, target);
        state = store.reduceEffect(state, attachEnergyEffect);

        next();
      }
    });
  } else {
    yield store.prompt(state, new ShowCardsPrompt(
      player.id,
      GameMessage.CARDS_SHOWED_BY_EFFECT,
      deckTop.cards
    ), () => {
      next();
    })
  }

  deckTop.moveTo(player.deck);

  return store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
    player.deck.applyOrder(order);
  });
}


export class Gloom extends PokemonCard {

  public id: number = 44;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Oddish';

  public cardType: CardType = CardType.GRASS;

  public hp: number = 70;

  public weakness = [{ type: CardType.FIRE }];

  public resistance: Resistance[] = [];

  public retreat: CardType[] = [CardType.COLORLESS];

  public powers: Power[] = [{
    name: 'Semi-Blooming Energy',
    powerType: PowerType.ABILITY,
    text:
      'When you play this Pokémon from your hand to evolve 1 of your Pokémon during your turn, ' +
      'you may look at the top 3 cards of your deck and attach any number of Basic Energy cards you ' +
      'find there to your Pokémon in any way you like. Shuffle the other cards back into your deck.'
  }];

  public attacks = [{
    name: 'Drool',
    cost: [CardType.COLORLESS, CardType.COLORLESS],
    damage: 30,
    text: ''
  }];

  public set: string = 'MEW';

  public name: string = 'Gloom';

  public fullName: string = 'Gloom MEW';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PlayPokemonEffect && effect.pokemonCard === this) {
      const generator = useSemiBloomingEnergy(() => generator.next(), store, state, this, effect);
      return generator.next().value;
    }

    return state;
  }
}
