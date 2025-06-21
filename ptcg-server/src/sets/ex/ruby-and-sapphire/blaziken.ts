import { AttackEffect, PowerEffect } from '../../../game/store/effects/game-effects';
import { Effect } from '../../../game/store/effects/effect';
import { GameMessage } from '../../../game/game-message';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, EnergyType, SuperType } from '../../../game/store/card/card-types';
import {
  StoreLike,
  State,
  GameError,
  Card,
  Power,
  PowerType,
  ConfirmPrompt,
  EnergyCard,
  AttachEnergyPrompt,
  PlayerType,
  SlotType,
  StateUtils
} from '../../../game';
import { DiscardCardsEffect, PutDamageEffect } from '../../../game/store/effects/attack-effects';
import { CheckProvidedEnergyEffect } from '../../../game/store/effects/check-effects';

export class Blaziken extends PokemonCard {

  public id: number = 3;

  public stage: Stage = Stage.STAGE_2;

  public evolvesFrom: string = 'Combusken';

  public cardTypes: CardType[] = [CardType.FIRE];

  public hp: number = 100;

  public weakness = [{ type: CardType.WATER }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public powers: Power[] = [{
    name: 'Firestarter',
    powerType: PowerType.POKEPOWER,
    useWhenInPlay: true,
    text:
      'Once during your turn (before your attack), ' +
      'you may attach a {R} Energy card from your discard pile to 1 of your Benched Pokémon. ' +
      'This power can\'t be used if Blaziken is affected by a Special Condition.',
  }];

  public attacks = [{
    name: 'Fire Stream',
    cost: [CardType.FIRE, CardType.COLORLESS, CardType.COLORLESS],
    damage: 50,
    text:
      'Discard a {R} Energy card attached to Blaziken. ' +
      'If you do, this attack does 10 damage to each of your opponent\'s Benched Pokémon. ' +
      '(Don\'t apply Weakness and Resistance for Benched Pokémon.)'
  }];

  public set: string = 'RS';

  public name: string = 'Blaziken';

  public fullName: string = '#3 Blaziken RS';

  private firestarterUsedTurn: number = -1;


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Firestarter
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const player = effect.player;

      const hasBenchedPokemon = player.bench.some(benchSlot => benchSlot.cards.length > 0);
      const hasFireEnergyInDiscard = player.discard.cards.some(c => {
        return c instanceof EnergyCard
          && c.energyType === EnergyType.BASIC
          && c.provides.includes(CardType.FIRE);
      });

      if (!hasFireEnergyInDiscard && !hasBenchedPokemon) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      if (this.firestarterUsedTurn === state.turn) {
        throw new GameError(GameMessage.POWER_ALREADY_USED);
      }

      state = store.prompt(state, new AttachEnergyPrompt(
        player.id,
        GameMessage.ATTACH_ENERGY_TO_BENCH,
        player.discard,
        PlayerType.BOTTOM_PLAYER,
        [SlotType.BENCH],
        { superType: SuperType.ENERGY, energyType: EnergyType.BASIC, provides: [CardType.FIRE] },
        { allowCancel: true, min: 1, max: 1 }
      ), transfers => {
        transfers = transfers || [];

        if (transfers.length === 0) {
          return;
        }

        for (const transfer of transfers) {
          const target = StateUtils.getTarget(state, player, transfer.to);
          player.discard.moveCardTo(transfer.card, target);
        }

        this.firestarterUsedTurn = state.turn;
      });
    }

    // Fire Stream
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      return store.prompt(state, new ConfirmPrompt(
        effect.player.id,
        GameMessage.WANT_TO_DISCARD_ENERGY
      ), result => {
        if (result) {
          const checkProvidedEnergy = new CheckProvidedEnergyEffect(player);
          store.reduceEffect(state, checkProvidedEnergy);

          const cards: Card[] = [];
          checkProvidedEnergy.energyMap.forEach(em => {
            if (em.provides.includes(CardType.FIRE) || em.provides.includes(CardType.ANY)) {
              cards.push(em.card);
            }
          });

          const discardEnergy = new DiscardCardsEffect(effect, cards);
          discardEnergy.target = player.active;
          state = store.reduceEffect(state, discardEnergy);

          effect.opponent.bench.forEach(target => {
            if (target.cards.length > 0) {
              const damageEffect = new PutDamageEffect(effect, 10);
              damageEffect.target = target;
              store.reduceEffect(state, damageEffect);
            }
          });
        }
      });
    }

    return state;
  }
}
