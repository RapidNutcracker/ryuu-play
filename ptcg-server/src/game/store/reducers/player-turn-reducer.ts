import { Action } from '../actions/action';
import { PassTurnAction, RetreatAction, AttackAction, UseAbilityAction, UseStadiumAction } from '../actions/game-actions';
import { State, GamePhase } from '../state/state';
import { StoreLike } from '../store-like';
import { GameError } from '../../game-error';
import { GameMessage } from '../../game-message';
import { RetreatEffect, UseAttackEffect, UsePowerEffect, UseStadiumEffect } from '../effects/game-effects';
import { EndTurnEffect } from '../effects/game-phase-effects';
import { StateUtils } from '../state-utils';
import { SlotType } from '../actions/play-card-action';
import { PokemonCard } from '../card/pokemon-card';
import { Attack, Power } from '../card/pokemon-types';
import { Card } from '../card/card';

export function playerTurnReducer(store: StoreLike, state: State, action: Action): State {

  if (state.phase === GamePhase.PLAYER_TURN) {

    if (action instanceof PassTurnAction) {
      const player = state.players[state.activePlayer];

      if (player === undefined || player.id !== action.clientId) {
        throw new GameError(GameMessage.NOT_YOUR_TURN);
      }

      const endTurnEffect = new EndTurnEffect(player);

      state = store.reduceEffect(state, endTurnEffect);
      return state;
    }

    if (action instanceof RetreatAction) {
      const player = state.players[state.activePlayer];

      if (player === undefined || player.id !== action.clientId) {
        throw new GameError(GameMessage.NOT_YOUR_TURN);
      }

      const retreatEffect = new RetreatEffect(player, action.benchIndex);
      state = store.reduceEffect(state, retreatEffect);
      return state;
    }

    if (action instanceof AttackAction) {
      const player = state.players[state.activePlayer];

      if (player === undefined || player.id !== action.clientId) {
        throw new GameError(GameMessage.NOT_YOUR_TURN);
      }

      const target = StateUtils.getTarget(state, player, action.target);

      let attack: Attack | undefined;
      const attackSourceCard = target.cards.find((card: any) => {
        if (card.hasOwnProperty('attacks')) {
          const cardAttack = card['attacks'].find((a: Attack) => a.name === action.name);
          if (cardAttack !== undefined) {
            attack = cardAttack;
            return true;
          }
        }

        return false;
      });

      if (attackSourceCard === undefined) {
        throw new GameError(GameMessage.UNKNOWN_CARD);
      }

      if (attack === undefined) {
        throw new GameError(GameMessage.UNKNOWN_ATTACK);
      }

      if (attackSourceCard instanceof PokemonCard &&
        target.getPokemonCard() !== attackSourceCard &&
        !player.marker.hasMarker('MEMORY_DIVE_MARKER')) {
        throw new GameError(GameMessage.UNKNOWN_CARD);
      }

      if (action.target.slot === SlotType.BENCH && !attack.useFromBench) {
        throw new GameError(GameMessage.CANNOT_USE_ATTACK);
      }

      const useAttackEffect = new UseAttackEffect(player, attack, attackSourceCard);
      state = store.reduceEffect(state, useAttackEffect);
      return state;
    }

    if (action instanceof UseAbilityAction) {
      const player = state.players[state.activePlayer];

      if (player === undefined || player.id !== action.clientId) {
        throw new GameError(GameMessage.NOT_YOUR_TURN);
      }

      let abilityCard: Card | undefined;

      switch (action.target.slot) {
        case SlotType.ACTIVE:
        case SlotType.BENCH: {
          const target = StateUtils.getTarget(state, player, action.target);
          abilityCard = target.cards.find((card: any) => {
            return card.hasOwnProperty('powers') &&
              card['powers'].find((p: Power) => p.name === action.name);
          });
          break;
        }
        case SlotType.DISCARD: {
          const discardCard = player.discard.cards[action.target.index];
          if (discardCard.hasOwnProperty('powers')) {
            abilityCard = discardCard;
          }
          break;
        }
        case SlotType.HAND: {
          const handCard = player.hand.cards[action.target.index];
          if (handCard.hasOwnProperty('powers')) {
            abilityCard = handCard;
          }
          break;
        }
      }

      if (abilityCard === undefined) {
        throw new GameError(GameMessage.INVALID_TARGET);
      }

      const power = (abilityCard as any).powers.find((a: Power) => a.name === action.name);
      if (power === undefined) {
        throw new GameError(GameMessage.UNKNOWN_POWER);
      }

      const slot = action.target.slot;
      if (slot === SlotType.ACTIVE || slot === SlotType.BENCH) {
        if (!power.useWhenInPlay) {
          throw new GameError(GameMessage.CANNOT_USE_POWER);
        }
      }

      if (slot === SlotType.HAND && !power.useFromHand) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      if (slot === SlotType.DISCARD && !power.useFromDiscard) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      state = store.reduceEffect(state, new UsePowerEffect(player, power, abilityCard));
      return state;
    }

    if (action instanceof UseStadiumAction) {
      const player = state.players[state.activePlayer];

      if (player === undefined || player.id !== action.clientId) {
        throw new GameError(GameMessage.NOT_YOUR_TURN);
      }

      if (player.stadiumUsedTurn === state.turn) {
        throw new GameError(GameMessage.STADIUM_ALREADY_USED);
      }

      const stadium = StateUtils.getStadiumCard(state);
      if (stadium === undefined) {
        throw new GameError(GameMessage.NO_STADIUM_IN_PLAY);
      }

      state = store.reduceEffect(state, new UseStadiumEffect(player, stadium));
      return state;
    }

  }

  return state;
}
