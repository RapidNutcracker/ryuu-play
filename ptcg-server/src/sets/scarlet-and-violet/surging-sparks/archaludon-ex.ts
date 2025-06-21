import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, CardTag, SuperType, EnergyType } from '../../../game/store/card/card-types';
import { StoreLike } from '../../../game/store/store-like';
import { GamePhase, State } from '../../../game/store/state/state';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect, EvolveEffect, PowerEffect } from '../../../game/store/effects/game-effects';
import { Power, PowerType, Resistance } from '../../../game/store/card/pokemon-types';
import { CheckPokemonStatsEffect } from '../../../game/store/effects/check-effects';
import { CardTarget, PlayerType, SlotType } from '../../../game/store/actions/play-card-action';
import { StateUtils } from '../../../game/store/state-utils';
import { GameMessage } from '../../../game/game-message';
import { EndTurnEffect } from '../../../game/store/effects/game-phase-effects';
import { AttachEnergyEffect } from '../../../game/store/effects/play-card-effects';
import { PokemonCardList } from '../../../game/store/state/pokemon-card-list';
import { AttachEnergyPrompt } from '../../../game/store/prompts/attach-energy-prompt';
import { ConfirmPrompt } from '../../../game/store/prompts/confirm-prompt';
import { EnergyCard } from '../../../game/store/card/energy-card';


function* useAssembleAlloy(next: Function, store: StoreLike, state: State, effect: EvolveEffect): IterableIterator<State> {
  const player = effect.player;

  if (player.discard.cards.length === 0) {
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

  const blockedTo: CardTarget[] = []
  const controlledMetalPokemon: PokemonCardList[] = [];
  player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (cardList, card, target) => {
    if (cardList.cards.length > 0) {
      const pokemonCard = cardList.getPokemonCard();
      if (pokemonCard !== undefined && pokemonCard.cardTypes.includes(CardType.METAL)) {
        controlledMetalPokemon.push(cardList);
      } else {
        blockedTo.push(target);
      }
    }
  });

  yield store.prompt(state, new AttachEnergyPrompt(
    player.id,
    GameMessage.ATTACH_ENERGY_CARDS,
    player.discard,
    PlayerType.BOTTOM_PLAYER,
    [SlotType.ACTIVE, SlotType.BENCH],
    { superType: SuperType.ENERGY, energyType: EnergyType.BASIC, provides: [CardType.METAL] },
    { min: 0, max: 2, allowCancel: true, blockedTo }
  ), transfers => {
    transfers = transfers || [];
    for (const transfer of transfers) {
      const target = StateUtils.getTarget(state, player, transfer.to);
      const energyCard = transfer.card as EnergyCard;

      const attachEnergyEffect = new AttachEnergyEffect(player, energyCard, target, player.discard);
      state = store.reduceEffect(state, attachEnergyEffect);
    }
    next();
  });

  return state;
}

export class ArchaludonEx extends PokemonCard {

  public id: number = 130;

  public tags: string[] = [CardTag.SMALL_EX];

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Duraludon';

  public cardTypes: CardType[] = [CardType.METAL];

  public hp: number = 300;

  public weakness = [{ type: CardType.FIRE }];

  public resistance: Resistance[] = [{ type: CardType.GRASS, value: -30 }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public powers: Power[] = [{
    name: 'Assemble Alloy',
    powerType: PowerType.ABILITY,
    text:
      'When you play this Pokémon from your hand to evolve 1 of your Pokémon during your turn, ' +
      'you may attach up to 2 Basic {M} Energy cards from your discard pile to your {M} Pokémon in any way you like.'
  }];

  public attacks = [{
    name: 'Metal Defender',
    cost: [CardType.METAL, CardType.METAL, CardType.METAL],
    damage: 220,
    text: 'During your opponent\'s next turn, this Pokémon has no Weakness.'
  }];

  public set: string = 'SSP';

  public name: string = 'Archaludon ex';

  public fullName: string = 'Archaludon ex SSP';

  public readonly METAL_DEFENDER_MARKER = 'METAL_DEFENDER_MARKER';

  public readonly CLEAR_METAL_DEFENDER_MARKER = 'CLEAR_METAL_DEFENDER_MARKER';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Assemble Alloy
    if (effect instanceof EvolveEffect && effect.pokemonCard === this) {
      if (state.phase !== GamePhase.PLAYER_TURN || state.players[state.activePlayer] !== effect.player) {
        return state;
      }

      const generator = useAssembleAlloy(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    // Metal Defender
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      player.active.marker.addMarker(this.METAL_DEFENDER_MARKER, this);
      opponent.marker.addMarker(this.CLEAR_METAL_DEFENDER_MARKER, this);
    }

    if (effect instanceof CheckPokemonStatsEffect && effect.target.marker.hasMarker(this.METAL_DEFENDER_MARKER, this)) {
      effect.weakness = [];
    }

    // Clear Metal Defender
    if (effect instanceof EndTurnEffect && effect.player.marker.hasMarker(this.CLEAR_METAL_DEFENDER_MARKER, this)) {
      effect.player.marker.removeMarker(this.CLEAR_METAL_DEFENDER_MARKER, this);

      effect.player.forEachPokemon(PlayerType.TOP_PLAYER, (cardList) => {
        cardList.marker.removeMarker(this.METAL_DEFENDER_MARKER, this)
      });
    }

    return state;
  }

}
