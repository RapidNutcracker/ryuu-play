import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';
import { StoreLike, State, Resistance, PlayerType, StateUtils, GamePhase, Attack, GameError } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect } from '../../game/store/effects/game-effects';
import { GameMessage } from '../../game/game-message';
import { AbstractAttackEffect } from '../../game/store/effects/attack-effects';
import { EndTurnEffect } from '../../game/store/effects/game-phase-effects';

export class Spearow extends PokemonCard {

  public id: number = 62;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.COLORLESS;

  public hp: number = 50;

  public weakness = [{ type: CardType.LIGHTNING }];

  public resistance: Resistance[] = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [];

  public attacks = [{
    name: 'Peck',
    cost: [CardType.COLORLESS],
    damage: 10,
    text: ''
  }, {
    name: 'Mirror Move',
    cost: [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS],
    damage: 0,
    text: 'If Spearow was attacked last turn, do the final result of that attack on Spearow to the Defending Pokémon.'
  }];

  public set: string = 'JU';

  public name: string = 'Spearow';

  public fullName: string = 'Spearow JU';

  private readonly MIRROR_MOVE_MARKER = 'MIRROR_MOVE_MARKER';
  private readonly CLEAR_MIRROR_MOVE_MARKER = 'CLEAR_MIRROR_MOVE_MARKER';

  private mirrorMoveAttack: Attack | undefined;

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Mirror Move
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      if (this.mirrorMoveAttack === undefined) {
        throw new GameError(GameMessage.CANNOT_USE_ATTACK);
      }

      const attackEffect = new AttackEffect(player, opponent, this.mirrorMoveAttack);
      return store.reduceEffect(state, attackEffect);
    }

    // Set Mirror Move Attack to Received Attack
    if (effect instanceof AbstractAttackEffect && effect.target.getPokemonCard() === this) {
      const targetPlayer = StateUtils.findOwner(state, effect.target);

      const attackerCard = effect.source.getPokemonCard();

      if (attackerCard === undefined) {
        throw new GameError(GameMessage.UNKNOWN_CARD);
      }

      if (state.phase === GamePhase.ATTACK) {
        targetPlayer.marker.addMarker(this.CLEAR_MIRROR_MOVE_MARKER, this);
        effect.target.marker.addMarker(this.MIRROR_MOVE_MARKER, attackerCard);
        this.mirrorMoveAttack = effect.attack;
      }

      return state;
    }

    // Clear Mirror Move
    if (effect instanceof EndTurnEffect && effect.player.marker.hasMarker(this.CLEAR_MIRROR_MOVE_MARKER, this)) {
      effect.player.marker.removeMarker(this.CLEAR_MIRROR_MOVE_MARKER, this);
      effect.player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (cardList) => {
        cardList.marker.removeMarker(this.MIRROR_MOVE_MARKER);
      })
    }

    return state;
  }
}
