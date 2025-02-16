import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType, SuperType, EnergyType } from '../../game/store/card/card-types';
import { StoreLike } from '../../game/store/store-like';
import { State } from '../../game/store/state/state';
import { Effect } from '../../game/store/effects/effect';
import { KnockOutEffect, PowerEffect } from '../../game/store/effects/game-effects';
import { Power, PowerType } from '../../game/store/card/pokemon-types';
import { StateUtils } from '../../game/store/state-utils';
import { GameError } from '../../game/game-error';
import { GameMessage } from '../../game/game-message';
import { AttachEnergyPrompt, CardTarget, EnergyCard, PlayerType, PokemonCardList, SlotType } from '../../game';
import { AttachEnergyEffect } from '../../game/store/effects/play-card-effects';

function* useOvervoltDischarge(next: Function, store: StoreLike, state: State,
  self: Magneton, effect: PowerEffect): IterableIterator<State> {
  const player = effect.player;

  if (player.discard.cards.length === 0) {
    throw new GameError(GameMessage.CANNOT_USE_POWER);
  }

  const blocked: CardTarget[] = []
  const benchedLightningPokemon: PokemonCardList[] = [];
  let magnetonSlot: PokemonCardList | undefined;
  player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (cardList, card, target) => {
    if (cardList.cards.length > 0) {
      const pokemonCard = cardList.getPokemonCard();
      if (pokemonCard !== undefined && pokemonCard.cardType === CardType.LIGHTNING) {
        if (pokemonCard === self) {
          blocked.push(target);
          magnetonSlot = cardList;
        }
        benchedLightningPokemon.push(cardList);
      } else {
        blocked.push(target);
      }
    }
  });

  if (magnetonSlot === undefined) {
    throw new GameError(GameMessage.INVALID_GAME_STATE);
  }

  if (benchedLightningPokemon.length === 0) {
    throw new GameError(GameMessage.CANNOT_USE_POWER);
  }

  let didAttachEnergy: boolean = false;
  yield store.prompt(state, new AttachEnergyPrompt(
    player.id,
    GameMessage.ATTACH_ENERGY_CARDS,
    player.discard,
    PlayerType.BOTTOM_PLAYER,
    [SlotType.ACTIVE, SlotType.BENCH],
    { superType: SuperType.ENERGY, energyType: EnergyType.BASIC },
    { min: 0, max: 3, allowCancel: true }
  ), transfers => {
    transfers = transfers || [];
    didAttachEnergy = transfers.length > 0;
    for (const transfer of transfers) {
      const target = StateUtils.getTarget(state, player, transfer.to);
      const energyCard = transfer.card as EnergyCard;

      const attachEnergyEffect = new AttachEnergyEffect(player, energyCard, target, player.discard);
      state = store.reduceEffect(state, attachEnergyEffect);
    }
    next();
  });

  if (didAttachEnergy) {
    const knockOutEffect = new KnockOutEffect(player, magnetonSlot)
    state = store.reduceEffect(state, knockOutEffect);
  }

  return state;
}

export class Magneton extends PokemonCard {

  public id: number = 59;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Magnemite';

  public cardType: CardType = CardType.LIGHTNING;

  public hp: number = 100;

  public weakness = [{ type: CardType.FIGHTING }];

  public retreat = [CardType.COLORLESS];

  public powers: Power[] = [{
    name: 'Overvolt Discharge',
    powerType: PowerType.ABILITY,
    useWhenInPlay: true,
    text:
      'Once during your turn, you may attach up to 3 Basic Energy cards ' +
      'from your discard pile to your {L} Pokémon in any way you like. ' +
      'If you use this Ability, this Pokémon is Knocked Out.'
  }];

  public attacks = [{
    name: 'Electro Ball',
    cost: [CardType.LIGHTNING, CardType.COLORLESS],
    damage: 40,
    text: ''
  }];

  public set: string = 'SSP';

  public name: string = 'Magneton';

  public fullName: string = 'Magneton SSP';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const generator = useOvervoltDischarge(() => generator.next(), store, state, this, effect);
      return generator.next().value;
    }

    return state;
  }

}
