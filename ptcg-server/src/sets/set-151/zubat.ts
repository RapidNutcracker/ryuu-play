import { Effect } from '../../game/store/effects/effect';
import { GameError } from '../../game/game-error';
import { GameMessage } from '../../game/game-message';
import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Power, PowerType, Resistance, Weakness } from '../../game/store/card/pokemon-types';
import { PowerEffect } from '../../game/store/effects/game-effects';
import { ShowCardsPrompt } from '../../game/store/prompts/show-cards-prompt';
import { Stage, CardType } from '../../game/store/card/card-types';
import { State } from '../../game/store/state/state';
import { StateUtils } from '../../game/store/state-utils';
import { StoreLike } from '../../game/store/store-like';

export class Zubat extends PokemonCard {

  public id: number = 41;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.DARKNESS;

  public hp: number = 40;

  public weakness: Weakness[] = [{ type: CardType.LIGHTNING }];

  public resistance: Resistance[] = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [CardType.COLORLESS];

  public powers: Power[] = [{
    name: 'Revealing Echo',
    useWhenInPlay: true,
    powerType: PowerType.ABILITY,
    text:
      'Once during your turn, if this Pokémon is in the Active Spot, ' +
      'you may have your opponent reveal their hand.'
  }];

  public attacks = [{
    name: 'Bite',
    cost: [CardType.COLORLESS],
    damage: 10,
    text: ''
  }];

  public set: string = 'MEW';

  public name: string = 'Zubat';

  public fullName: string = 'Zubat MEW';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Revealing Echo
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const player = effect.player;

      const opponent = StateUtils.getOpponent(state, player);

      // Zubat is not Active
      if (player.active.getPokemonCard() !== this) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      return store.prompt(state, new ShowCardsPrompt(
        player.id,
        GameMessage.CARDS_SHOWED_BY_THE_OPPONENT,
        opponent.hand.cards
      ), () => { });
    }

    return state;
  }

}
