import { AttachEnergyEffect, PlayPokemonEffect } from '../../game/store/effects/play-card-effects';
import { AttachEnergyPrompt, CardList, ConfirmPrompt, EnergyCard, GameError, PlayerType, Power, PowerType, ShufflePrompt, SlotType, StateUtils } from '../../game';
import { AttackEffect, EvolveEffect, PowerEffect } from '../../game/store/effects/game-effects';
import { PutDamageEffect } from '../../game/store/effects/attack-effects';
import { Effect } from '../../game/store/effects/effect';
import { GameMessage } from '../../game/game-message';
import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType, CardTag, SuperType, EnergyType } from '../../game/store/card/card-types';
import { GamePhase, State } from '../../game/store/state/state';
import { StoreLike } from '../../game/store/store-like';


function* useInfernalReign(next: Function, store: StoreLike, state: State, effect: PlayPokemonEffect): IterableIterator<State> {
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
    const powerEffect = new PowerEffect(player, effect.pokemonCard.powers[0], effect.pokemonCard);
    store.reduceEffect(state, powerEffect);
  } catch {
    return state;
  }

  if (player.deck.cards.length === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  const fireEnergy = new CardList();
  player.deck.moveCardsTo(player.deck.cards.filter(card => card.name === 'Fire Energy'), fireEnergy);

  yield store.prompt(state, new AttachEnergyPrompt(
    player.id,
    GameMessage.ATTACH_ENERGY_CARDS,
    fireEnergy,
    PlayerType.BOTTOM_PLAYER,
    [SlotType.ACTIVE, SlotType.BENCH],
    { superType: SuperType.ENERGY, energyType: EnergyType.BASIC, name: 'Fire Energy' },
    { min: 0, max: 3, allowCancel: true }
  ), transfers => {
    transfers = transfers || [];
    for (const transfer of transfers) {
      const target = StateUtils.getTarget(state, player, transfer.to);
      const energyCard = transfer.card as EnergyCard;
      const attachEnergyEffect = new AttachEnergyEffect(player, energyCard, target, fireEnergy);
      state = store.reduceEffect(state, attachEnergyEffect);
    }
    next();
  });

  fireEnergy.moveTo(player.deck);

  return store.prompt(state, new ShufflePrompt(player.id), order => {
    player.deck.applyOrder(order);
  });
}

export class CharizardEx extends PokemonCard {

  public id: number = 54;

  public tags: string[] = [CardTag.EX, CardTag.TERA];

  public stage: Stage = Stage.STAGE_2;

  public evolvesFrom = 'Charmeleon';

  public cardType: CardType = CardType.DARKNESS;

  public hp: number = 330;

  public weakness = [{ type: CardType.GRASS }];

  public resistance = [];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public powers: Power[] = [{
    name: 'Infernal Reign',
    powerType: PowerType.ABILITY,
    text:
      'When you play this Pokémon from your hand to evolve 1 of your Pokémon during your turn, ' +
      'you may search your deck for up to 3 Basic {R} Energy cards ' +
      'and attach them to your Pokémon in any way you like. Then, shuffle your deck.'
  }];

  public attacks = [{
    name: 'Burning Darkness',
    cost: [CardType.FIRE, CardType.FIRE],
    damage: 180,
    text: 'This attack does 30 more damage for each Prize card your opponent has taken.'
  }];

  public set: string = 'PAF';

  public name: string = 'Charizard ex';

  public fullName: string = 'Charizard ex PAF';

  public rules: string[] = [
    'When your Pokémon ex is Knocked Out, your opponent takes 2 Prize cards.',
    'As long as this Pokémon is on your Bench, prevent all damage done to this Pokémon by attacks (both yours and your opponent\'s).'
  ];

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    // Infernal Reign
    if (effect instanceof EvolveEffect && effect.pokemonCard === this) {
      const generator = useInfernalReign(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    // Burning Darkness
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      /// TODO: Dynamic Prize Size
      effect.damage += (6 - effect.opponent.getPrizeLeft()) * 30;
      return state;
    }

    // Tera Pokémon ex rule
    if (effect instanceof PutDamageEffect && effect.target.getPokemonCard() === this) {

      // It's not an attack
      if (state.phase !== GamePhase.ATTACK) {
        return state;
      }

      const player = StateUtils.findOwner(state, effect.target);
      const benchIndex = player.bench.indexOf(effect.target);
      if (benchIndex === -1) {
        return state;
      }

      effect.preventDefault = true;
    }

    return state;
  }
}
