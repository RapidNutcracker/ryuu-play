import { StoreLike, State, StateUtils, Card, ChooseEnergyPrompt, PlayerType } from '../../../game';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { GameMessage } from '../../../game/game-message';
import { AbstractAttackEffect, DiscardCardsEffect } from '../../../game/store/effects/attack-effects';
import { CheckProvidedEnergyEffect } from '../../../game/store/effects/check-effects';
import { EndTurnEffect } from '../../../game/store/effects/game-phase-effects';

export class Mewtwo extends PokemonCard {

  public id: number = 10;

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.PSYCHIC];

  public hp: number = 60;

  public weakness = [{ type: CardType.PSYCHIC }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: 'Psychic',
      cost: [CardType.PSYCHIC, CardType.COLORLESS],
      damage: 10,
      text: 'Does 10 damage plus 10 more damage for each Energy card attached to the Defending Pokémon.'
    },
    {
      name: 'Barrier',
      cost: [CardType.PSYCHIC, CardType.PSYCHIC],
      damage: 0,
      text: 'Discard 1 {P} Energy card attached to Mewtwo in order to prevent all effects of attacks, including damage, done to Mewtwo during your opponent\'s next turn.'
    }
  ];

  public set: string = 'BS';

  public name: string = 'Mewtwo';

  public fullName: string = 'Mewtwo BS';

  private readonly BARRIER_MARKER = 'BARRIER_MARKER';

  private readonly CLEAR_BARRIER_MARKER = 'CLEAR_BARRIER_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Psychic
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      const checkProvidedEnergyEffect = new CheckProvidedEnergyEffect(opponent);
      store.reduceEffect(state, checkProvidedEnergyEffect);
      const energyCount = checkProvidedEnergyEffect.energyMap.reduce((left, p) => left + p.provides.length, 0);
      effect.damage += energyCount * 10;
    }

    // Barrier
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      const checkProvidedEnergy = new CheckProvidedEnergyEffect(player);
      state = store.reduceEffect(state, checkProvidedEnergy);

      state = store.prompt(state, new ChooseEnergyPrompt(
        player.id,
        GameMessage.CHOOSE_ENERGIES_TO_DISCARD,
        checkProvidedEnergy.energyMap,
        [CardType.PSYCHIC],
        { allowCancel: false }
      ), energy => {
        const cards: Card[] = (energy || []).map(e => e.card);
        const discardEnergy = new DiscardCardsEffect(effect, cards);
        discardEnergy.target = player.active;
        store.reduceEffect(state, discardEnergy);

        player.active.marker.addMarker(this.BARRIER_MARKER, this);
        opponent.marker.addMarker(this.CLEAR_BARRIER_MARKER, this);
      });

      return state;
    }

    // Has Barrier Up
    if (effect instanceof AbstractAttackEffect && effect.target.marker.hasMarker(this.BARRIER_MARKER)) {
      effect.preventDefault = true;
      return state;
    }

    if (effect instanceof EndTurnEffect && effect.player.marker.hasMarker(this.CLEAR_BARRIER_MARKER, this)) {

      effect.player.marker.removeMarker(this.CLEAR_BARRIER_MARKER, this);

      const opponent = StateUtils.getOpponent(state, effect.player);
      opponent.forEachPokemon(PlayerType.TOP_PLAYER, (cardList) => {
        cardList.marker.removeMarker(this.BARRIER_MARKER, this);
      });
    }

    return state;
  }

}
