import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, Resistance, ChoosePokemonPrompt, PlayerType, SlotType, StateUtils, GamePhase, Attack, GameError } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { GameMessage } from '../../../game/game-message';
import { AfterDamageEffect } from '../../../game/store/effects/attack-effects';
import { EndTurnEffect } from '../../../game/store/effects/game-phase-effects';

export class Pidgeotto extends PokemonCard {

  public id: number = 22;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Pidgey';

  public cardTypes: CardType[] = [CardType.COLORLESS];

  public hp: number = 60;

  public weakness = [{ type: CardType.LIGHTNING }];

  public resistance: Resistance[] = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: 'Whirlwind',
      cost: [CardType.COLORLESS, CardType.COLORLESS],
      damage: 20,
      text: 'If your opponent has any Benched Pokémon, he or she chooses 1 of them and switches it with the Defending Pokémon. (Do the damage before switching the Pokémon.)'
    },
    {
      name: 'Mirror Move',
      cost: [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS],
      damage: 0,
      text: 'If Pidgeotto was attacked last turn, do the final result of that attack on Pidgeotto to the Defending Pokémon.'
    }
  ];

  public set: string = 'BS';

  public name: string = 'Pidgeotto';

  public fullName: string = 'Pidgeotto BS';

  private readonly MIRROR_MOVE_MARKER = 'MIRROR_MOVE_MARKER';

  private readonly CLEAR_MIRROR_MOVE_MARKER = 'CLEAR_MIRROR_MOVE_MARKER';

  private mirrorMoveAttack: Attack | undefined;

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Whirlwind
    if (effect instanceof AfterDamageEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      const opponentHasBench = opponent.bench.some(b => b.cards.length > 0);

      if (!opponentHasBench) {
        return state;
      }

      return store.prompt(state, new ChoosePokemonPrompt(
        opponent.id,
        GameMessage.CHOOSE_POKEMON_TO_SWITCH,
        PlayerType.BOTTOM_PLAYER,
        [SlotType.BENCH],
        { allowCancel: false }
      ), result => {
        const cardList = result[0];
        opponent.switchPokemon(cardList);
      });
    }

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
    if (effect instanceof AttackEffect && effect.opponent.active.getPokemonCard() === this) {
      const attackerCard = effect.player.active.getPokemonCard();

      if (attackerCard === undefined) {
        throw new GameError(GameMessage.UNKNOWN_CARD);
      }

      if (state.phase === GamePhase.ATTACK) {
        effect.opponent.marker.addMarker(this.CLEAR_MIRROR_MOVE_MARKER, this);
        effect.opponent.active.marker.addMarker(this.MIRROR_MOVE_MARKER, attackerCard);
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
