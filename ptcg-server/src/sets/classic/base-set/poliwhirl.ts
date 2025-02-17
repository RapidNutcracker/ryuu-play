import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, CoinFlipPrompt, Resistance, Weakness, Attack, ChooseAttackPrompt, StateUtils, GameError } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { GameLog, GameMessage } from '../../../game/game-message';
import { EndTurnEffect } from '../../../game/store/effects/game-phase-effects';

export class Poliwhirl extends PokemonCard {

  public id: number = 38;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Poliwag';

  public cardTypes: CardType[] = [CardType.WATER];

  public hp: number = 60;

  public weakness: Weakness[] = [{ type: CardType.GRASS }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: 'Amnesia',
      cost: [CardType.WATER, CardType.WATER],
      damage: 0,
      text: 'Choose 1 of the Defending Pokémon\'s attacks. That Pokémon can\'t use that attack during your opponent\'s next turn.'
    },
    {
      name: 'Doubleslap',
      cost: [CardType.WATER, CardType.WATER, CardType.COLORLESS],
      damage: 30,
      text: 'Flip 2 coins. This attack does 30 damage times the number of heads.'
    }
  ];

  public set: string = 'BS';

  public name: string = 'Poliwhirl';

  public fullName: string = 'Poliwhirl BS';

  public readonly AMNESIA_MARKER = 'AMNESIA_MARKER';

  public readonly CLEAR_AMNESIA_MARKER = 'CLEAR_AMNESIA_MARKER';

  public disabledAttack: Attack | null = null;

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Amnesia
    /// TODO: Does this work?
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);
      const pokemonCard = opponent.active.getPokemonCard();

      if (pokemonCard === undefined || pokemonCard.attacks.length === 0) {
        return state;
      }

      let selected: any;
      return store.prompt(state, new ChooseAttackPrompt(
        player.id,
        GameMessage.CHOOSE_ATTACK_TO_DISABLE,
        [pokemonCard],
        { allowCancel: false }
      ), result => {
        selected = result;

        const attack: Attack | null = selected;

        if (attack === null) {
          return state;
        }

        store.log(state, GameLog.LOG_PLAYER_DISABLES_ATTACK, {
          name: player.name,
          attack: attack.name
        });

        // Disable attack
        this.disabledAttack = selected;
        player.marker.addMarker(this.AMNESIA_MARKER, this);
      });
    }

    /// TODO: Does this work?
    if (effect instanceof AttackEffect && effect.attack === this.disabledAttack) {
      throw new GameError(GameMessage.ILLEGAL_ACTION);
    }

    // Doubleslap
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;
      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP),
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], results => {
        let heads: number = 0;
        results.forEach(r => { heads += r ? 1 : 0; });
        effect.damage = 30 * heads;
      });
    }

    /// TODO: Does this work?
    if (effect instanceof EndTurnEffect) {
      effect.player.marker.removeMarker(this.AMNESIA_MARKER, this);
    }

    return state;
  }

}
