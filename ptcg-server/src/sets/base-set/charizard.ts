import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';
import { PowerType, StoreLike, State, GameError, GameMessage, PokemonCardList, StateUtils, Card, ChooseEnergyPrompt, PlayerType } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect, PowerEffect } from '../../game/store/effects/game-effects';
import { CheckProvidedEnergyEffect } from '../../game/store/effects/check-effects';
import { DiscardCardsEffect } from '../../game/store/effects/attack-effects';
import { EndTurnEffect } from '../../game/store/effects/game-phase-effects';


export class Charizard extends PokemonCard {

  public id: number = 4;

  public stage: Stage = Stage.STAGE_2;

  public evolvesFrom = 'Charmeleon';

  public cardType: CardType = CardType.FIRE;

  public hp: number = 120;

  public weakness = [{ type: CardType.WATER }];

  public resistance = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public powers = [{
    name: 'Energy Burn',
    useWhenInPlay: true,
    powerType: PowerType.POKEPOWER,
    text: 'As often as you like during your turn (before your attack), you may turn all Energy attached to Charizard into {R} Energy for the rest of the turn. This power can\'t be used if Charizard is Asleep, Confused, or Paralyzed.'
  }];

  public attacks = [
    { name: 'Fire Spin', cost: [CardType.FIRE, CardType.FIRE, CardType.FIRE, CardType.FIRE], damage: 100, text: 'Discard 2 Energy cards attached to Charizard in order to use this attack.' },
  ];

  public set: string = 'BS';

  public name: string = 'Charizard';

  public fullName: string = 'Charizard BS';

  public readonly ENERGY_BURN_MARKER = 'ENERGY_BURN_MARKER';

  public readonly CLEAR_ENERGY_BURN_MARKER = 'CLEAR_ENERGY_BURN_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    // Energy Burn
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const player = effect.player;
      const cardList = StateUtils.findCardList(state, this);
      if (!(cardList instanceof PokemonCardList)) {
        return state;
      }
      if (cardList.marker.hasMarker(this.ENERGY_BURN_MARKER, this)) {
        throw new GameError(GameMessage.POWER_ALREADY_USED);
      }
      player.marker.addMarker(this.CLEAR_ENERGY_BURN_MARKER, this);
      cardList.marker.addMarker(this.ENERGY_BURN_MARKER, this);

      return state;
    }

    // Fire Spin
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      const checkProvidedEnergy = new CheckProvidedEnergyEffect(player);
      state = store.reduceEffect(state, checkProvidedEnergy);

      state = store.prompt(state, new ChooseEnergyPrompt(
        player.id,
        GameMessage.CHOOSE_ENERGIES_TO_DISCARD,
        checkProvidedEnergy.energyMap,
        [CardType.FIRE, CardType.FIRE],
        { allowCancel: false }
      ), energy => {
        const cards: Card[] = (energy || []).map(e => e.card);
        const discardEnergy = new DiscardCardsEffect(effect, cards);
        discardEnergy.target = player.active;
        store.reduceEffect(state, discardEnergy);
      });
    }

    if (effect instanceof CheckProvidedEnergyEffect && effect.source.marker.hasMarker(this.ENERGY_BURN_MARKER, this)) {
      effect.energyMap.forEach(em => {
        em.provides.forEach(p => p = CardType.FIRE);
      });
      return state;
    }

    if (effect instanceof EndTurnEffect
      && effect.player.marker.hasMarker(this.CLEAR_ENERGY_BURN_MARKER, this)) {
      const player = effect.player;
      player.marker.removeMarker(this.CLEAR_ENERGY_BURN_MARKER, this);
      player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (cardList) => {
        cardList.marker.removeMarker(this.ENERGY_BURN_MARKER, this);
      });
    }

    return state;
  }
}
