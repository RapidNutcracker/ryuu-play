import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';
import { StoreLike, State, GameMessage, CoinFlipPrompt, Attack, PlayerType, SlotType, ChoosePokemonPrompt, StateUtils, GameError } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AfterDamageEffect } from '../../game/store/effects/attack-effects';
import { AttackEffect, RetreatEffect } from '../../game/store/effects/game-effects';
import { EndTurnEffect } from '../../game/store/effects/game-phase-effects';

export class Victreebel extends PokemonCard {

  public id: number = 14;

  public stage: Stage = Stage.STAGE_2;

  public evolvesFrom: string = 'Weepinbell';

  public cardType: CardType = CardType.GRASS;

  public hp: number = 80;

  public weakness = [{ type: CardType.FIRE }];

  public resistance = [];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks: Attack[] = [{
    name: 'Lure',
    cost: [CardType.GRASS],
    damage: 0,
    text: 'If your opponent has any Benched Pokémon, choose 1 of them and switch it with his or her Active Pokémon.'
  }, {
    name: 'Acid',
    cost: [CardType.GRASS, CardType.GRASS],
    damage: 20,
    text: 'Flip a coin. If heads, the Defending Pokémon can\'t retreat during your opponent\'s next turn.'
  }];

  public set: string = 'JU';

  public name: string = 'Victreebel';

  public fullName: string = 'Victreebel JU';

  public readonly ACID_MARKER = 'ACID_MARKER';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Lure
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      const opponentHasBench = opponent.bench.some(b => b.cards.length > 0);

      if (!opponentHasBench) {
        return state;
      }

      return store.prompt(state, new ChoosePokemonPrompt(
        player.id,
        GameMessage.CHOOSE_POKEMON_TO_SWITCH,
        PlayerType.TOP_PLAYER,
        [SlotType.BENCH],
        { allowCancel: false }
      ), result => {
        const cardList = result[0];
        opponent.switchPokemon(cardList);
      });
    }

    // Acid
    if (effect instanceof AfterDamageEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;
      const opponent = effect.opponent;

      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], result => {
        if (result === true) {
          opponent.active.marker.addMarker(this.ACID_MARKER, this);
        }
      });
    }

    // Acid is Active
    if (effect instanceof RetreatEffect && effect.player.active.marker.hasMarker(this.ACID_MARKER, this)) {
      effect.preventDefault = true;
      throw new GameError(GameMessage.BLOCKED_BY_EFFECT);
    }

    // Clear Acid
    if (effect instanceof EndTurnEffect && effect.player.active.marker.hasMarker(this.ACID_MARKER, this)) {
      effect.player.active.marker.removeMarker(this.ACID_MARKER, this);
    }

    return state;
  }
}
