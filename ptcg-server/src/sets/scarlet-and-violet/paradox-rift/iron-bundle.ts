import { ChoosePokemonPrompt, GameError, GameMessage, PlayerType, Power, PowerType, SlotType, StateUtils } from '../../../game';
import { AttackEffect, PowerEffect, UseAttackEffect } from '../../../game/store/effects/game-effects';
import { Effect } from '../../../game/store/effects/effect';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, CardTag } from '../../../game/store/card/card-types';
import { State } from '../../../game/store/state/state';
import { StoreLike } from '../../../game/store/store-like';
import { EndTurnEffect } from '../../../game/store/effects/game-phase-effects';

export class IronBundle extends PokemonCard {

  public id: number = 56;

  public tags: string[] = [CardTag.FUTURE];

  public stage: Stage = Stage.BASIC

  public cardType: CardType = CardType.WATER;

  public hp: number = 100;

  public weakness = [{ type: CardType.LIGHTNING }];

  public resistance = [];

  public retreat = [CardType.COLORLESS];

  public powers: Power[] = [{
    name: 'Hyper Blower',
    powerType: PowerType.ABILITY,
    useWhenInPlay: true,
    text:
      'Once during your turn, if this Pokémon is on your Bench, ' +
      'you may switch out your opponent\'s Active Pokémon to the Bench. ' +
      '(Your opponent chooses the new Active Pokémon.) ' +
      'If you do, discard this Pokémon and all attached cards.'
  }];

  public attacks = [{
    name: 'Refrigerated Stream',
    cost: [CardType.WATER, CardType.COLORLESS, CardType.COLORLESS],
    damage: 80,
    text:
      'If the Defending Pokémon is an Evolution Pokémon, ' +
      'it can\'t attack during your opponent\'s next turn.'
  }];

  public set: string = 'PAR';

  public name: string = 'Iron Bundle';

  public fullName: string = 'Iron Bundle PAR';

  private readonly REFRIGERATED_STREAM = 'REFRIGERATED_STREAM';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    // Hyper Blower
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      // Opponent doesn't have any benched Pokémon
      const doesOpponentHaveBenchedPokemon = opponent.bench.some(benchSlot => benchSlot.cards.length > 0);
      if (!doesOpponentHaveBenchedPokemon) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      // Iron Bundle is not on the bench
      const benchIndex = player.bench.findIndex(benchSlot => benchSlot.getPokemonCard() === this);
      if (benchIndex === -1) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      return store.prompt(state, new ChoosePokemonPrompt(
        player.id,
        GameMessage.CHOOSE_NEW_ACTIVE_POKEMON,
        PlayerType.TOP_PLAYER,
        [SlotType.BENCH],
        { allowCancel: false },
      ), selected => {
        if (!selected || selected.length === 0) {
          return state;
        }

        opponent.switchPokemon(selected[0]);

        player.bench[benchIndex].moveTo(player.discard);
      });
    }

    // Iron Breaker
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      const opponentActivePokemonCard = opponent.active.getPokemonCard();
      if (opponentActivePokemonCard === undefined) {
        throw new GameError(GameMessage.UNKNOWN_CARD);
      }

      if ([Stage.STAGE_1, Stage.STAGE_2].some(stage => opponentActivePokemonCard.stage === stage)) {
        opponent.active.marker.addMarker(this.REFRIGERATED_STREAM, this);
      }

      return state;
    }

    if (effect instanceof UseAttackEffect && effect.player.active.marker.hasMarker(this.REFRIGERATED_STREAM, this)) {
      throw new GameError(GameMessage.BLOCKED_BY_EFFECT);
    }

    if (effect instanceof EndTurnEffect && effect.player.active.marker.hasMarker(this.REFRIGERATED_STREAM, this)) {
      effect.player.active.marker.removeMarker(this.REFRIGERATED_STREAM, this);
    }

    return state;
  }
}
