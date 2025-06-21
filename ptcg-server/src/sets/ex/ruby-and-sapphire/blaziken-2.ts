import { AttackEffect, RetreatEffect } from '../../../game/store/effects/game-effects';
import { Effect } from '../../../game/store/effects/effect';
import { GameMessage } from '../../../game/game-message';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import {
  StoreLike,
  State,
  GameError,
  ChooseEnergyPrompt,
  Card
} from '../../../game';
import { AfterDamageEffect, DiscardCardsEffect } from '../../../game/store/effects/attack-effects';
import { EndTurnEffect } from '../../../game/store/effects/game-phase-effects';
import { CheckProvidedEnergyEffect } from '../../../game/store/effects/check-effects';

export class Blaziken2 extends PokemonCard {

  public id: number = 15;

  public stage: Stage = Stage.STAGE_2;

  public evolvesFrom: string = 'Combusken';

  public cardTypes: CardType[] = [CardType.FIRE];

  public hp: number = 110;

  public weakness = [{ type: CardType.WATER }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [{
    name: 'Clutch',
    cost: [CardType.COLORLESS, CardType.COLORLESS],
    damage: 20,
    text: 'The Defending Pokémon can\'t retreat until the end of your opponent\'s next turn.'
  }, {
    name: 'Flamethrower',
    cost: [CardType.FIRE, CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS],
    damage: 80,
    text: 'Discard a {R} Energy card attached to Blaziken.'
  }];

  public set: string = 'RS';

  public name: string = 'Blaziken';

  public fullName: string = '#15 Blaziken RS';

  public readonly CLUTCH_MARKER = 'CLUTCH_MARKER';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Clutch
    if (effect instanceof AfterDamageEffect && effect.attack === this.attacks[0]) {
      const opponent = effect.opponent;

      opponent.active.marker.addMarker(this.CLUTCH_MARKER, this);
    }

    // Flamethrower
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;

      const checkProvidedEnergy = new CheckProvidedEnergyEffect(player);
      state = store.reduceEffect(state, checkProvidedEnergy);

      return store.prompt(state, new ChooseEnergyPrompt(
        player.id,
        GameMessage.CHOOSE_ENERGIES_TO_DISCARD,
        checkProvidedEnergy.energyMap,
        [CardType.FIRE],
        { allowCancel: false }
      ), energy => {
        const cards: Card[] = (energy || []).map(e => e.card);
        const discardEnergy = new DiscardCardsEffect(effect, cards);
        discardEnergy.target = player.active;
        store.reduceEffect(state, discardEnergy);
      });
    }

    // Clutch is Active
    if (effect instanceof RetreatEffect && effect.player.active.marker.hasMarker(this.CLUTCH_MARKER, this)) {
      throw new GameError(GameMessage.BLOCKED_BY_EFFECT);
    }

    // Clear Clutch
    if (effect instanceof EndTurnEffect && effect.player.active.marker.hasMarker(this.CLUTCH_MARKER, this)) {
      effect.player.active.marker.removeMarker(this.CLUTCH_MARKER, this);
    }

    return state;
  }
}
