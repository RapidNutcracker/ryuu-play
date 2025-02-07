import { AddSpecialConditionsEffect } from '../../game/store/effects/attack-effects';
import { AttackEffect, PowerEffect } from '../../game/store/effects/game-effects';
import { CheckProvidedEnergyEffect } from '../../game/store/effects/check-effects';
import { Effect } from '../../game/store/effects/effect';
import { EndTurnEffect } from '../../game/store/effects/game-phase-effects';
import { GameMessage } from '../../game/game-message';
import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType, SpecialCondition } from '../../game/store/card/card-types';
import {
  StoreLike,
  State,
  Resistance,
  Weakness,
  Attack,
  Power,
  PowerType,
  PokemonCardList,
  StateUtils,
  GameError,
  PlayerType,
  CardTarget,
  ChoosePokemonPrompt,
  SlotType
} from '../../game';


function* useAdrenaBrain(next: Function, store: StoreLike, state: State, effect: PowerEffect): IterableIterator<State> {
  const player = effect.player;

  let hasDamagedPokemon = false;
  const blocked: CardTarget[] = [];
  player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (cardList, card, target) => {
    if (cardList.cards.length > 0 && cardList.damage > 0) {
      hasDamagedPokemon = true;
    } else {
      blocked.push(target);
    }
  });

  if (!hasDamagedPokemon) {
    throw new GameError(GameMessage.CANNOT_USE_POWER);
  }

  let moveDamageFrom: PokemonCardList[] = [];
  yield store.prompt(state, new ChoosePokemonPrompt(
    player.id,
    GameMessage.MOVE_DAMAGE,
    PlayerType.BOTTOM_PLAYER,
    [SlotType.ACTIVE, SlotType.BENCH],
    { allowCancel: false, blocked }
  ), selectedSlots => {
    moveDamageFrom = selectedSlots;
    next();
  });

  let moveDamageTo: PokemonCardList[] = [];
  yield store.prompt(state, new ChoosePokemonPrompt(
    player.id,
    GameMessage.MOVE_DAMAGE,
    PlayerType.TOP_PLAYER,
    [SlotType.ACTIVE, SlotType.BENCH],
    { allowCancel: false }
  ), selectedSlots => {
    moveDamageTo = selectedSlots;
    next();
  });

  moveDamageFrom.forEach((_, index) => {
    const damageToMove = Math.min(moveDamageFrom[index].damage, 30);

    moveDamageFrom[index].damage -= damageToMove;
    moveDamageTo[index].damage += damageToMove
  });

  return state;
}

export class Munkidori extends PokemonCard {

  public id: number = 95;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.PSYCHIC;

  public hp: number = 110;

  public weakness: Weakness[] = [{ type: CardType.DARK }];

  public resistance: Resistance[] = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat: CardType[] = [CardType.COLORLESS];

  public powers: Power[] = [{
    name: 'Adrena-Brain',
    powerType: PowerType.ABILITY,
    useWhenInPlay: true,
    text:
      'Once during your turn, if this Pokémon has any {D} Energy attached, ' +
      'you may move up to 3 damage counters from 1 of your Pokémon to 1 of your opponent\'s Pokémon.'
  }];

  public attacks: Attack[] = [{
    name: 'Mind Bend',
    cost: [CardType.PSYCHIC, CardType.COLORLESS],
    damage: 60,
    text: 'Your opponent\'s Active Pokémon is now Confused.'
  }];

  public set: string = 'TWM';

  public name: string = 'Munkidori';

  public fullName: string = 'Munkidori TWM';

  public readonly ADRENA_BRAIN_MARKER = 'ADRENA_BRAIN_MARKER';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Adrena-Brain
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const player = effect.player;
      const slot = StateUtils.findCardList(state, this) as PokemonCardList;

      if (slot.marker.hasMarker(this.ADRENA_BRAIN_MARKER, this)) {
        throw new GameError(GameMessage.POWER_ALREADY_USED);
      }

      const checkProvidedEnergyEffect = new CheckProvidedEnergyEffect(player, slot);
      store.reduceEffect(state, checkProvidedEnergyEffect);

      const energyMap = checkProvidedEnergyEffect.energyMap;
      const hasDarkEnergyAttached = StateUtils.checkEnoughEnergy(energyMap, [CardType.DARK]);

      if (!hasDarkEnergyAttached) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      slot.marker.addMarker(this.ADRENA_BRAIN_MARKER, this);

      const generator = useAdrenaBrain(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    // Mind Bend
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const specialCondition = new AddSpecialConditionsEffect(effect, [SpecialCondition.CONFUSED]);
      return store.reduceEffect(state, specialCondition);
    }

    // Clear Adrena-Brain Marker
    if (effect instanceof EndTurnEffect) {
      effect.player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (cardList) => {
        cardList.marker.removeMarker(this.ADRENA_BRAIN_MARKER, this);
      });
    }

    return state;
  }

}
