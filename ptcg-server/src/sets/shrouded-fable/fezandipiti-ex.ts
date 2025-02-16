import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType, CardTag } from '../../game/store/card/card-types';
import { StoreLike } from '../../game/store/store-like';
import { GamePhase, State } from '../../game/store/state/state';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect, KnockOutEffect, PowerEffect } from '../../game/store/effects/game-effects';
import { StateUtils } from '../../game/store/state-utils';
import { GameMessage } from '../../game/game-message';
import { PlayerType, SlotType } from '../../game/store/actions/play-card-action';
import { Attack, ChoosePokemonPrompt, GameError, Power, PowerType, Resistance } from '../../game';
import { PutDamageEffect } from '../../game/store/effects/attack-effects';
import { EndTurnEffect } from '../../game/store/effects/game-phase-effects';

export class FezandipitiEx extends PokemonCard {

  public id: number = 38;

  public tags: string[] = [CardTag.EX];

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.DARKNESS;

  public hp: number = 210;

  public weakness = [{ type: CardType.FIGHTING }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS];

  public powers: Power[] = [{
    name: 'Flip the Script',
    powerType: PowerType.ABILITY,
    useWhenInPlay: true,
    text:
      'Once during your turn, ' +
      'if any of your Pokémon were Knocked Out during your opponent\'s last turn, ' +
      'you may draw 3 cards. ' +
      'You can\'t use more than 1 Flip the Script Ability each turn.'
  }];

  public attacks: Attack[] = [{
    name: 'Cruel Arrow',
    cost: [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS],
    damage: 0,
    text:
      'This attack does 100 damage to 1 of your opponent\'s Pokémon. ' +
      '(Don\'t apply Weakness and Resistance for Benched Pokémon.)'
  }];

  public set: string = 'SFA';

  public name: string = 'Fezandipiti ex';

  public fullName: string = 'Fezandipiti ex SFA';

  private readonly ENABLE_FLIP_THE_SCRIPT_MARKER = 'ENABLE_FLIP_THE_SCRIPT_MARKER';

  private readonly USED_FLIP_THE_SCRIPT_MARKER = 'USED_FLIP_THE_SCRIPT_MARKER';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Flip the Script 
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const player = effect.player;

      if (player.deck.cards.length === 0 || !player.marker.hasMarker(this.ENABLE_FLIP_THE_SCRIPT_MARKER)) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      if (player.marker.hasMarker(this.USED_FLIP_THE_SCRIPT_MARKER)) {
        throw new GameError(GameMessage.POWER_ALREADY_USED);
      }

      player.deck.moveTo(player.hand, 3);

      player.marker.addMarker(this.USED_FLIP_THE_SCRIPT_MARKER, this);
    }

    // Enable Flip the Script
    if (effect instanceof KnockOutEffect) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);
      const duringTurn = [GamePhase.PLAYER_TURN, GamePhase.ATTACK].includes(state.phase);

      // Do not activate between turns, or when it's not opponents turn.
      if (!duringTurn || state.players[state.activePlayer] !== opponent) {
        return state;
      }

      const cardList = StateUtils.findCardList(state, this);
      const owner = StateUtils.findOwner(state, cardList);
      if (owner === player) {
        effect.player.marker.addMarker(this.ENABLE_FLIP_THE_SCRIPT_MARKER, this);
      }
      return state;
    }

    // Cruel Arrow
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      return store.prompt(state, new ChoosePokemonPrompt(
        player.id,
        GameMessage.CHOOSE_POKEMON_TO_DAMAGE,
        PlayerType.TOP_PLAYER,
        [SlotType.ACTIVE, SlotType.BENCH],
        { allowCancel: false }
      ), selected => {
        const targets = selected || [];
        if (targets.includes(opponent.active)) {
          effect.damage = 100;
          return;
        }

        targets.forEach(target => {
          const damageEffect = new PutDamageEffect(effect, 100);
          damageEffect.target = target;
          store.reduceEffect(state, damageEffect);
        });
      });
    }

    // Clear Used Flip the Script Marker
    if (effect instanceof EndTurnEffect && effect.player.marker.hasMarker(this.USED_FLIP_THE_SCRIPT_MARKER, this)) {
      effect.player.marker.removeMarker(this.USED_FLIP_THE_SCRIPT_MARKER, this);
    }

    return state;
  }

}
