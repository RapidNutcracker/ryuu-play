import { StateUtils } from '../../../game';
import { AttackEffect, KnockOutEffect } from '../../../game/store/effects/game-effects';
import { Effect } from '../../../game/store/effects/effect';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, CardTag } from '../../../game/store/card/card-types';
import { GamePhase, State } from '../../../game/store/state/state';
import { StoreLike } from '../../../game/store/store-like';

export class IronHandsEx extends PokemonCard {

  public id: number = 70;

  public tags: string[] = [CardTag.EX, CardTag.FUTURE];

  public stage: Stage = Stage.BASIC

  public cardType: CardType = CardType.LIGHTNING;

  public hp: number = 230;

  public weakness = [{ type: CardType.FIGHTING }];

  public resistance = [];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [{
    name: 'Arm Press',
    cost: [CardType.LIGHTNING, CardType.LIGHTNING, CardType.COLORLESS],
    damage: 160,
    text: ''
  }, {
    name: 'Amp You Very Much',
    cost: [CardType.LIGHTNING, CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS],
    damage: 120,
    text: 'If your opponent\'s Pokémon is Knocked Out by damage from this attack, take 1 more Prize card.'
  }];

  public set: string = 'PAR';

  public name: string = 'Iron Hands ex';

  public fullName: string = 'Iron Hands ex PAR';

  public rules: string[] = [
    'When your Pokémon ex is Knocked Out, your opponent takes 2 Prize cards.',
  ]

  private ampYouVeryMuchUsedTurn: number = -1;


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Amp You Very Much
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      this.ampYouVeryMuchUsedTurn = state.turn;
      return state;
    }

    // Amp You Very Much KO'd
    if (effect instanceof KnockOutEffect && effect.target === effect.player.active) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      // Do not activate between turns, or when it's not opponents turn.
      if (state.phase !== GamePhase.ATTACK || state.players[state.activePlayer] !== opponent) {
        return state;
      }

      // Iron Hands ex wasn't attacking
      const pokemonCard = opponent.active.getPokemonCard();
      if (pokemonCard !== this) {
        return state;
      }

      // Iron Hands ex used Amp You Very Much; increase prize count
      if (this.ampYouVeryMuchUsedTurn === state.turn) {
        effect.prizeCount += 1;
      }

      return state;
    }

    return state;
  }
}
